import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Poi } from '../types/poi';

interface Quan4Db extends DBSchema {
  pois: {
    key: string;
    value: Poi;
  };
}

const DB_NAME = 'quan4-culinary-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<Quan4Db>> | null = null;

export const getDb = () => {
  if (!dbPromise) {
    dbPromise = openDB<Quan4Db>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('pois')) {
          db.createObjectStore('pois', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
};

export const poiStorage = {
  async getAll(): Promise<Poi[]> {
    const db = await getDb();
    return db.getAll('pois');
  },

  async getById(id: string): Promise<Poi | undefined> {
    const db = await getDb();
    return db.get('pois', id);
  },

  async putBulk(pois: Poi[]): Promise<void> {
    const db = await getDb();
    const tx = db.transaction('pois', 'readwrite');
    await Promise.all([
      ...pois.map(poi => tx.store.put(poi)),
      tx.done
    ]);
  },

  async clear(): Promise<void> {
    const db = await getDb();
    await db.clear('pois');
  }
};
