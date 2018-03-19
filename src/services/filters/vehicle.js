/**
 * @file defines Vue filters for working with WOT vehicles
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

export default (GameInfo) => {
  return {
    'wot-vehicle-name': id => GameInfo.game_vehicles[id].shortUserString,
    'wot-vehicle-type': id => GameInfo.game_vehicles[id].type,
    'wot-vehicle-nation': id => GameInfo.game_vehicles[id].nation,
    'wot-vehicle-tier': id => GameInfo.game_vehicles[id].level,
    'wot-vehicle-ispremium': id => GameInfo.game_vehicles[id].isPremium,
    'wot-vehicle-icon': id => GameInfo.game_vehicles[id].icon,
    'wot-tier': tier => {
      switch (tier.toString()) {
        case '1': return 'I'
        case '2': return 'II'
        case '3': return 'II'
        case '4': return 'IV'
        case '5': return 'V'
        case '6': return 'VI'
        case '7': return 'VII'
        case '8': return 'VIII'
        case '9': return 'IX'
        case '10': return 'X'
        default: return tier
      }
    }
  }
}
