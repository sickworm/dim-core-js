import * as mkm from "dim-mkm-js"
import * as dkd from "dim-dkd-js"
import { CoreError, StorageError } from "./error";

interface SymmKeyCreator {
    create(): mkm.SymmKey
}

// TODO use AES instead
class PlainKey implements mkm.SymmKey {
    private static _instance = new PlainKey()

    algorithm = "PLAIN"
    data = "PLAIN"

    static getInstance(): PlainKey {
        return PlainKey._instance
    }
    
    encrypt(data: Buffer): Buffer {
        return Buffer.from(data)
    }

    decrypt(encryptedData: Buffer): Buffer {
        return Buffer.from(encryptedData)
    }
}

interface CipherKeyDataSource {

    /**
     * Update/create cipher key for encrypt message content
     *
     * @param sender - from where (user ID)
     * @param receiver - to where (contact/group ID)
     * @param key - old key to be reused (nullable)
     * @return new key
     */
    getCipherKey(sender: mkm.ID, receiver: mkm.ID): mkm.SymmKey
}

interface CipherKeyStorage {
    get(sender: mkm.ID, receiver: mkm.ID): mkm.SymmKey | null
    set(sender: mkm.ID, receiver: mkm.ID, key: mkm.SymmKey): void
    refresh(key: mkm.SymmKey): void
}

class CipherKeyStorageRamImpl implements CipherKeyStorage {
    private _map: Map<string, Map<string, mkm.SymmKey>> = new Map()

    get(sender: mkm.ID, receiver: mkm.ID): mkm.SymmKey | null {
        let senderKeys = this._map.get(sender.string)
        if (!senderKeys) {
            return null
        }
        let key = senderKeys.get(receiver.string)
        if (!key) {
            return null
        }
        return key
    }

    set(sender: mkm.ID, receiver: mkm.ID, key: mkm.SymmKey): void {
        let senderKeys = this._map.get(sender.string)
        if (!senderKeys) {
            senderKeys = new Map()
            this._map.set(sender.string, senderKeys)
        }
        senderKeys.set(receiver.string, key)
    }

    refresh(key: mkm.SymmKey): void {
    }
}

class KeyCache implements CipherKeyDataSource {
    private static _instance = new KeyCache()

    static getInstance(): KeyCache {
        return KeyCache._instance
    }

    private _storage = new CipherKeyStorageRamImpl()
    private _crypto: SymmKeyCreator = { create: function() { return PlainKey.getInstance() }}

    private constructor() {
    }

    getCipherKey(sender: mkm.ID, receiver: mkm.ID): mkm.SymmKey {
        let key = this._storage.get(sender, receiver)
        if (key == null) {
            key = this._crypto.create()
            this._storage.set(sender, receiver, key)
        } else {
            this._storage.refresh(key)
        }
        return key
    }

    createCipherKey(data: any): mkm.SymmKey {
        // TODO judge PLAIN and aes
        return PlainKey.getInstance()
    }
}

export { KeyCache }