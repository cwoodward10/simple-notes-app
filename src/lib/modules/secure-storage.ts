import { createStore, del, get, set, keys, type UseStore, clear } from 'idb-keyval';
import { decrypt, decryptMasterKey, encrypt, genEncryptedMasterKey, updatePassphraseKey, type ProtectedMasterKey } from 'easy-web-crypto';

const encryptedKeyKey = '__key';

export type Dump = Record<string | number, any>;

export class SecureStore {
  public storeName: string;
  private _store: UseStore | null  = null;
  private _encMasterKey?: ProtectedMasterKey;
  private _key?: CryptoKey;

  private get key(): CryptoKey {
    if (!this._key) {
      throw new Error('Master key not initialized')
    }
    return this._key;
  }

  public get mounted() {
    return this._key != null;
  }
  
  constructor (storeName: string) {
    this.storeName = storeName;
  }

  /**
   * Initiates an instance of the SecureStore idb. 
   * @returns True if store has been mounted previously. False if not.
   */
  async init() {
    this._store = createStore(this.storeName, this.storeName);
    
    const key = await get(encryptedKeyKey, this._store);
    return key != null;
  }

  async mount(passphrase: string) {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    try {
      let encryptedKey: ProtectedMasterKey | undefined = await get(encryptedKeyKey, this._store);
      // generate a new key for the user if no key exists (empty store)
      if (!encryptedKey) {
        encryptedKey = await genEncryptedMasterKey(passphrase);
        // store the new key since it's the first time
        await set(encryptedKeyKey, encryptedKey, this._store);
      }

      // decrypt key so we can use it during this session
      this._encMasterKey = encryptedKey;
      this._key = await decryptMasterKey(passphrase, this._encMasterKey);

      return true;
    } catch (e: any) {
        throw new Error(e.message);
    }
  }

  async updatePassphrase(oldPass: string, newPass: string) {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    try {
      if (!this._encMasterKey) {
        throw new Error('No password to update set');
      }

      const encryptedKey = await updatePassphraseKey(oldPass, newPass, this._encMasterKey);
      await set(encryptedKeyKey, encryptedKey, this._store);
      
      this._encMasterKey = encryptedKey;
    } catch (e: any) {
        throw new Error(e.message);
    }
  }

  async set (key: IDBValidKey, val: string | object) {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    val = await encrypt(this.key, val);

    return set(key, val, this._store)
  }

  async get (key: IDBValidKey) {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    const val = await get(key, this._store);
    if (!val) {
      // undefined data cant/doesn't need to be decrypted
      return val;
    }

    // decrypt data before returning it
    return await decrypt(this.key, val);
  }

  del (key: IDBValidKey) {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    return del(key, this._store);
  }

  async keys (): Promise<IDBValidKey[]> {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    const result = await keys(this._store);
    return result.filter(key => key !== encryptedKeyKey);
  }

  clear (): Promise<void> {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    return clear(this._store);
  }

  destroy () {
    return new Promise((resolve, reject) => {
      const req = window.indexedDB.deleteDatabase(this.storeName)
      req.onsuccess = (e) => {
        resolve(e)
      }
      req.onerror = (e) => {
        reject(e)
      }
    })
  }

  async export () {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    const dump: Dump = {};

    const keys = await this.keys();
    if (keys) {
      for (const key of keys) {
        if (typeof key !== 'string' && typeof key !== 'number') {
          continue;
        }

        const data = await get(key, this._store)
        dump[key] = data
      }
    }
    return dump
  }

  async import (data: Dump) {
    if (!this._store) {
      throw new Error('Store not mounted. Run init() before any command');
    }

    if (!data || Object.keys(data).length === 0) {
      throw new Error('No data provided')
    }

    if (Object.prototype.toString.call(data) !== '[object Object]') {
      throw new Error('Data must be a valid JSON object')
    }

    for (const key of Object.keys(data)) {
      await set(key, data[key], this._store)
    }
  }
}