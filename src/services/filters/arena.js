/**
 * @file defines Vue filters for working with WOT arenas
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */
export default (GameInfo) => {
  return {
    'wot-arena-name': id => GameInfo.arenas[id][0],
    'wot-arena-title': id => GameInfo.arenas[id][1]
  }
}
