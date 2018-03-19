/**
 * @file exports `WotDB` class (inherited from `ISubscriber`).
 * @description
 *  - subscribes on events of the `ConnWebSocket` class;
 *  - gets clean data (battles results), converts to necessary format
 *    and saves into `IndexedDB` (see structure DB inside `applyVersion` method);
 *  - dispatches an event `EVENTS.NEW_BATTLE` when new data was received.
 *
 * @example
 * ```
 * var db = new WotDB();
 * db.open()
 * db.AllAccounts()
 *   .then(accs => accs[0])
 *   .then(acc_id => db.AllBattles(acc_id))
 *   .then(b => `DB has ${b.length} records with accId=${b[0].accountDBID}`)
 *   .then(str => console.log(str))
 *
 * db.addListener('add-battles-key-example', battles => {
 *   console.log(`Catched new battles: ${battles.length}`, battles)
 * })
 * ```
 *
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from 'lodash'
import Dexie from 'Dexie'
import pako from 'pako'
import * as moment from 'moment'
import ISubscriber from './class/subscriber'
import Ratings from './class/efficiency'

export default class WotDB extends ISubscriber {
  constructor (ws) {
    super()

    this.config = {
      // gui: 'WoTLoggerDB',
      id: 'WLViewDB'
    }

    this.db = void 0
    this.ws = ws
  }

  applyVersion () {
    this.db.version(1).stores({
      battles_common: '++id, &arenaUniqueID, arenaCreateTime, *playerVehicles, arenaTypeID, isSquad, bonusType',
      battles_personal: 'id, &[id+typeCompDescr]',
      battles_vehicles: '&id',
      battles_players: '&id'
    })
    this.db.version(2).stores({
      battles_common: '++id, &arenaUniqueID, arenaCreateTime, *playerVehicles, arenaTypeID, isSquad, bonusType, accountDBID',
      battles_personal: 'id, &[id+typeCompDescr]',
      battles_vehicles: '&id',
      battles_players: '&id',
      accounts: '++id, &WGid, login'
    }).upgrade(() => {
      var accounts = {}
      this.db.battles_personal.each(personal => {
        if (!accounts[personal.accountDBID]) {
          accounts[personal.accountDBID] = {key: personal.id, WGid: personal.accountDBID}
        }
      })
      .then(() => {
        const keys = _.map(accounts, 'key')
        return this.db.battles_players.where('id').anyOf(keys).each(row => {
          const find = _.find(accounts, account => account.key === row.id)
          accounts[find.WGid].login = row[find.WGid].name
        })
      })
      .then(() => {
        return this.db.transaction('rw', this.db.accounts, () => {
          _.each(accounts, account => {
            delete account.key
            this.db.accounts.put(account)
          })
        })
      })
      .then(() => {
        return this.db.transaction('rw',
          this.db.battles_personal, this.db.battles_common, () => {
            this.db.battles_personal.each(async personal => {
              const doc = await this.db.battles_common.get(personal.id)
              doc.accountDBID = personal.accountDBID
              this.db.battles_common.put(doc)
            })
          })
      })
    })
  }

  open () {
    if (this.db !== void 0) {
      throw new Error('db already was opened')
    }

    this.db = new Dexie(this.config.id)
    this.applyVersion()

    if (this.ws) {
      this.ws.addListener(this.EVENTS.HANDSHAKE, this.InitDBBattles.bind(this))
      this.ws.addListener(this.EVENTS.UPDATE, msg => {
        this.addBattles(this.UpdateDBBattles(msg))
      })
      this.ws.addListener(this.EVENTS.NEW_BATTLE, msg => {
        this.addBattles(this.UpdateDBBattles([msg]))
      })
    }
  }

  InitDBBattles (ids) {
    this.db.battles_common
    .each(battle => _.pull(ids, battle.arenaUniqueID.toString()))
    .then(() => this.ws.send({messageType: this.EVENTS.REQUEST_BATTLES, need: ids}))
    .catch(err => console.error('InitDBBattles, while filtering, list requested ids:', ids, err))
  }

  UpdateDBBattles (msg) {
    return _.map(msg, m => atob(m))
            .map(battle => pako.inflate(battle, {to: 'string'}))
            .map(battle => JSON.parse(battle))
            .map(battle => {
              battle.common.arenaUniqueID = battle.arenaUniqueID
              battle.common.server = battle.server.split('.')[1]
              if (battle.battleLevel !== void 0) {
                battle.common.battleLevel = battle.battleLevel
              }
              return battle
            })
  }

  addBattles (battles) {
    var transaction = battle => {
      const personal = _.first(_.values(battle.personal))
      battle.common.accountDBID = personal.accountDBID

      return this.db.transaction('rw',
            this.db.battles_common,
            this.db.battles_personal,
            this.db.battles_vehicles,
            this.db.battles_players,
            () => {
              return this.db.battles_common.add(battle.common)
              .then(id => {
                battle.vehicles.id = id
                battle.players.id = id
                battle.common.id = id

                personal.id = id
              })
            })
      .then(async () => {
        const wgid = {WGid: personal.accountDBID}
        const login = battle.players[personal.accountDBID].name

        let account = await this.db.accounts.get(wgid) || wgid
        if (account.login !== login) {
          this.db.accounts.put(_.extend(account, { login }))
        }
      })
      .then(() => this.db.battles_personal.add(personal))
      .then(() => this.db.battles_vehicles.add(battle.vehicles))
      .then(() => this.db.battles_players.add(battle.players))
      .then(id => {
        console.log('added battle success with id:', id)
        this.dispatchEvent(this.EVENTS.NEW_BATTLE,
          this.Convert({
            common: battle.common,
            personal: personal
          })
        )
      })
      .catch('ConstraintError', async () => {
        // patch for a race condition between different browser tabs
        const common = await
            this.db.battles_common
                .where('arenaUniqueID').equals(battle.arenaUniqueID)
                .first()
        const personal = await this.db.battles_personal.get(common.id)

        this.dispatchEvent(this.EVENTS.NEW_BATTLE, this.Convert({common, personal}))
      })
      .catch(err =>
        console.error(
          'addBattle transaction error:', err,
          'battle:', battle
        )
      )
    }

    _.each(battles, battle => transaction.call(this, battle))
  }

  Convert (battles) {
    if (!_.isArray(battles)) battles = [battles]

    let data = _.map(battles, battle => {
      let out = {
        id: battle.common.id,
        accountDBID: battle.common.accountDBID
      }

      out.create = moment(battle.common.arenaCreateTime * 1000)
      out.arena = {
        id: battle.common.arenaTypeID & 65535,
        create: battle.common.arenaCreateTime,
        // duration: battle.common.durationage,
        gametype: battle.common.bonusType
      }
      out.battle = {
        isSurvive: battle.personal.deathReason === -1,
        isVictory: battle.personal.team === battle.common.winnerTeam,
        spotted: battle.personal.spotted,
        // xp: {
        //   real: battle.personal.originalXP,
        //   crew: battle.personal.tmenXP,
        //   total: battle.personal.xp
        // },
        // credits: {
        //   given: battle.personal.credits,
        //   income: battle.personal.incomeCredits
        // },
        kills: battle.personal.kills,
        damage: {
          dealt: battle.personal.damageDealt,
          received: battle.personal.damageReceived
        },
        assist: {
          radio: battle.personal.damageAssistedRadio,
          track: battle.personal.damageAssistedTrack,
          stun: battle.personal.damageAssistedStun
        },
        points: {
          defeat: battle.personal.droppedCapturePoints,
          capture: battle.personal.capturePoints
        }
      }
      out.vehicle = {
        // type: void 0,
        // tier: void 0,
        id: battle.common.playerVehicle || _.first(battle.common.playerVehicles)
      }

      return out
    })

    // calculate ratings and add its to objects
    _.each(data, d => {
      d.battle.ratings = {}
      Object.keys(Ratings).forEach(rating => {
        let rate = new Ratings[rating](d)
        d.battle.ratings[rating] = {
          rate: rate.Rate,
          xvm: rate.RateXVM,
          color: rate.Color
        }
      })
    })

    return data
  }

  AllAccounts () {
    return this.db.accounts.toArray()
  }

  AllBattles (account_id) {
    return this.db.battles_common
      .where({accountDBID: account_id})
      // .toCollection()
      .toArray()
      .then(battles => {
        return Dexie.Promise.all([
          Dexie.Promise.resolve(battles),
          Dexie.Promise.all(
            battles.map(battle => this.db.battles_personal
                                      .where('id')
                                      .anyOf(battle.id)
                                      .toArray())
          )
        ])
      })
      .then(data => {
        let commons = data[0]
        let personals = _.map(data[1], d => d[0])

        let battles = _.map(commons, obj => {
          return {
            common: obj,
            personal: _.find(personals, {id: obj.id})
          }
        })

        return _.reject(battles, obj => !obj.personal)
      })
      .then(this.Convert)
  }
}
