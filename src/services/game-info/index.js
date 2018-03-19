/**
 * @file exports `GameInfo` object that include overall information
 * about World Of Tanks stuff: vehicles, arenas, etc...
 *
 * @description
 * WOTLogger MOD creates a JSON file that include an overall data
 * of the current WOT client version. We will use the file.
 * However if the code will run under development environment
 * (command `npm start`), the file will not be available.
 * In this case we will use a mock data file  (`./default.js`)
 * includes game data.
 *
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import GameInfoDefault from './default'

let GameInfo = GameInfoDefault
if (typeof window.gameInfo === 'object') {
  GameInfo = window.gameInfo
}

export default GameInfo
