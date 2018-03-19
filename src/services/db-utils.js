/**
 * @file exports functions for working with IndexedDB or/and Dexie.
 * @description see JSDoc for every function
 * @author Vitaliy Busko <vitaliy.opensource@gmail.com>
 */

import Dexie from 'dexie'

/**
 * Returns keys of the `table`
 * @param {Dexie.Table} table
 * @returns {String} string that describe keys of the `table`
 */
function getIndex (table) {
  var keys = table.schema.indexes.map(index => index.src)
  keys.unshift(table.schema.primKey.src)
  return keys.join(', ')
}

/**
 * Returns structure of the `db`
 * @param {Dexie} db
 * @returns {Object} Store of the `db`
 */
function getStore (db) {
  var store = {}
  db.tables.forEach(table => (store[table.name] = getIndex(table)))
  return store
}

/**
 * Clone an IndexedDB table
 * @param {Dexie} db DB that will be cloned
 * @param {String} name Name of a new table
 * @returns {Promise<undefined>} Resolves promise when cloning table will finished
 */
async function Clone (db, name) {
  if (typeof name !== 'string') {
    throw new Error(`'name' param must be a string, ${typeof name} given`)
  }

  await Dexie.exists(name).then(is_exists => {
    if (is_exists) {
      throw new Error(`DB with name ${name} already exists`)
    }
  })

  var tables = db.tables.map(table => table.name)

  const clone = new Dexie(name)
  clone.version(1).stores(getStore(db))

  for (let i = 0; i < tables.length; i++) {
    try {
      const array = await db.table(tables[i]).toCollection().toArray()
      await clone.transaction('rw', tables[i], () => {
        return clone.table(tables[i]).bulkAdd(array)
      })
    } catch (e) {
      clone.close()
      if (e.name === 'OpenFailedError') {
        return false
      } else {
        throw e
      }
    }
  }

  clone.close()
  return true
}

export default {
  getIndex, getStore, Clone
}
