/**
 * @file exports `ExpectedValues` class that manages ETV versions
 * @description See description class
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import _ from 'lodash'

/**
 * Placeholder for access to LocalStorage
 * by `ExpectedValues` class.
 * @const {String}
 */
const LSKey = 'etv-engine'

/**
 * The class manages ETV: save/load current version.
 * `ETV` is a global variable that include overall information of
 * all expended tank values' versions and defined in `jsonp_loader.js` file.
 */
export default class ExpectedValues {
  /**
   * Create an instance of ExpectedValues class.
   * @param {String} rating - Name of the rating
   */
  constructor (rating) {
    this.rating = rating.toLowerCase()

    /* eslint-disable no-undef */
    this.header = ETV.header()[this.rating]
    this.header = _.filter(this.header, item => !item.rejected && !item.disabled)
    /* eslint-enable no-undef */
  }

  /**
   * Gets the LocalStorage key by which located ETV
   * @member {String}
   */
  get LSKey () {
    return LSKey + this.rating
  }

  /**
   * Gets the current Expended Tank Values (ETV)
   * @member {Promise<Object>}
   */
  get CurrentValues () {
    return this.getCurrent().then(d => d.file)
  }

  /**
   * Gets title of the current Expended Tank Values (ETV)
   * @member {Promise<String>}
   */
  get CurrentKey () {
    return this.getCurrent().then(d => d.title)
  }

  /**
   * Sets current ETV-data by title
   * @param {String} title - Title of the selected ETV version
   * @returns {Promise<Object>} - Selected ETV version (full-object)
   */
  setCurrent (title) {
    let item = _.find(this.header, ['title', title])
    if (!_.isObject(item)) return Promise.reject()

    return Promise.resolve(item)
      .then(item => {
        if (item.file) {
          return item
        } else if (item.id) {
          return ((item.file = this.List[item.id].file), item)
        }

        return fetch(item.url)
          .then(res => res.json())
          .then(json => {
            return ((item.file = json), item)
          })
      })
      .then(item => {
        localStorage.setItem(this.LSKey, JSON.stringify(item))
        return item
      })
      .catch(e => console.log('can\'t set new `current` version', e))
  }

  /**
   * Gets current ETV-data
   * @returns {Promise<Object>}
   */
  getCurrent () {
    let current = localStorage.getItem(this.LSKey)
    if (current) {
      return Promise.resolve(JSON.parse(current))
    } else { // default expected values: first object in source.json
      return Promise.resolve(this.header)
        .then(list => _.first(list))
        .then(first => {
          if (first.file) {
            return first
          } else if (first.id) {
            return ((first.file = this.List[first.id]), first)
          } else {
            return fetch(first.url)
              .then(res => res.json())
              .then(json => {
                return ((first.file = json), first)
              })
          }
        })
        .then(first => {
          localStorage.setItem(this.LSKey, JSON.stringify(first))
          return first
        })
    }
  }

  /**
   * Gets list of all included ETV files
   * @member {Array<Object>}
   */
  get List () {
    // eslint-disable-next-line no-undef
    return ETV.list()
  }

  toString () {
    return "ExpectedValues `" + this.rating + "` class"
  }

}
