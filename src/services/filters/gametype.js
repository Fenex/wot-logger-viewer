/**
 * @file defines Vue filters for working with WOT gametypes
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */
export default (GameInfo) => {
  return {
    'wot-gametype-title': id => GameInfo.bonusTypes[id]
  }
}
