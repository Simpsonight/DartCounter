import type { Player } from '~/types/player'
import type { Match } from '~/types/match'
import type { Game } from '~/types/game'

const DB_NAME = 'DartCounterDB'
const DB_VERSION = 1

export interface DBSchema {
  players: Player
  matches: Match
  activeGames: Game
  settings: { key: string; value: any }
}

export type StoreName = keyof DBSchema

let dbInstance: IDBDatabase | null = null

export const useIndexedDB = () => {
  const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      // Check if running in browser
      if (!process.client || typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not available'))
        return
      }

      if (dbInstance) {
        resolve(dbInstance)
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => {
        reject(new Error('Failed to open database'))
      }

      request.onsuccess = () => {
        dbInstance = request.result
        resolve(dbInstance)
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Players store
        if (!db.objectStoreNames.contains('players')) {
          const playerStore = db.createObjectStore('players', { keyPath: 'id' })
          playerStore.createIndex('name', 'name', { unique: false })
          playerStore.createIndex('createdAt', 'createdAt', { unique: false })
        }

        // Matches store
        if (!db.objectStoreNames.contains('matches')) {
          const matchStore = db.createObjectStore('matches', { keyPath: 'id' })
          matchStore.createIndex('completedAt', 'completedAt', { unique: false })
          matchStore.createIndex('gameMode', 'gameMode', { unique: false })
          matchStore.createIndex('winnerId', 'winnerId', { unique: false })
        }

        // Active games store
        if (!db.objectStoreNames.contains('activeGames')) {
          const gameStore = db.createObjectStore('activeGames', { keyPath: 'id' })
          gameStore.createIndex('startedAt', 'startedAt', { unique: false })
          gameStore.createIndex('status', 'status', { unique: false })
        }

        // Settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' })
        }
      }
    })
  }

  const add = async <T extends StoreName>(
    storeName: T,
    value: DBSchema[T]
  ): Promise<string> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.add(value)

      request.onsuccess = () => {
        resolve(request.result as string)
      }

      request.onerror = () => {
        reject(new Error(`Failed to add to ${storeName}`))
      }
    })
  }

  const put = async <T extends StoreName>(
    storeName: T,
    value: DBSchema[T]
  ): Promise<string> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(value)

      request.onsuccess = () => {
        resolve(request.result as string)
      }

      request.onerror = () => {
        reject(new Error(`Failed to update ${storeName}`))
      }
    })
  }

  const get = async <T extends StoreName>(
    storeName: T,
    key: string
  ): Promise<DBSchema[T] | undefined> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(key)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get from ${storeName}`))
      }
    })
  }

  const getAll = async <T extends StoreName>(
    storeName: T
  ): Promise<DBSchema[T][]> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get all from ${storeName}`))
      }
    })
  }

  const getAllByIndex = async <T extends StoreName>(
    storeName: T,
    indexName: string,
    value: any
  ): Promise<DBSchema[T][]> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const index = store.index(indexName)
      const request = index.getAll(value)

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error(`Failed to get by index from ${storeName}`))
      }
    })
  }

  const remove = async <T extends StoreName>(
    storeName: T,
    key: string
  ): Promise<void> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.delete(key)

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to delete from ${storeName}`))
      }
    })
  }

  const clear = async <T extends StoreName>(storeName: T): Promise<void> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.clear()

      request.onsuccess = () => {
        resolve()
      }

      request.onerror = () => {
        reject(new Error(`Failed to clear ${storeName}`))
      }
    })
  }

  const count = async <T extends StoreName>(storeName: T): Promise<number> => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.count()

      request.onsuccess = () => {
        resolve(request.result)
      }

      request.onerror = () => {
        reject(new Error(`Failed to count ${storeName}`))
      }
    })
  }

  return {
    openDB,
    add,
    put,
    get,
    getAll,
    getAllByIndex,
    remove,
    clear,
    count
  }
}
