import * as mkm from "dim-mkm-js"
import * as dkd from "dim-dkd-js"
import { CoreError, ProtocolError } from "./error";

type SymmKeyType = 'PLAIN' | 'AES'

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
    get(keyType: SymmKeyType, sender: mkm.ID, receiver: mkm.ID): mkm.SymmKey | null
    set(keyType: SymmKeyType, sender: mkm.ID, receiver: mkm.ID, key: mkm.SymmKey): void
    refresh(key: mkm.SymmKey): void
}

class CipherKeyStorageRamImpl implements CipherKeyStorage {
    private _map: Map<SymmKeyType, Map<string, Map<string, mkm.SymmKey>>> = new Map()

    get(keyType: SymmKeyType,sender: mkm.ID, receiver: mkm.ID): mkm.SymmKey | null {
        let keys = this._map.get(keyType)
        if (!keys) {
            return null
        }
        let senderKeys = keys.get(sender.string)
        if (!senderKeys) {
            return null
        }
        let key = senderKeys.get(receiver.string)
        if (!key) {
            return null
        }
        return key
    }

    set(keyType: SymmKeyType,sender: mkm.ID, receiver: mkm.ID, key: mkm.SymmKey): void {
        let keys = this._map.get(keyType)
        if (!keys) {
            keys = new Map()
            this._map.set(keyType, keys)
        }
        let senderKeys = keys.get(sender.string)
        if (!senderKeys) {
            senderKeys = new Map()
            keys.set(sender.string, senderKeys)
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

    private constructor() {
    }

    getCipherKey(sender: mkm.ID, receiver: mkm.ID, type: SymmKeyType = 'AES'): mkm.SymmKey {
        let key = this._storage.get(type, sender, receiver)
        if (key == null) {
            key = this.createCipherKey(type)
            this._storage.set(type, sender, receiver, key)
        } else {
            this._storage.refresh(key)
        }
        return key
    }

    createCipherKey(type: SymmKeyType) {
        switch (type) {
            case 'PLAIN': return PlainKey.getInstance()
            case 'AES': return mkm.AesSymmKey.create()
            default: throw new CoreError(ProtocolError.SECURE_KEY_FORMAT_INVALID, `key type: ${type}`)
        }
    }

    buildCipherKey(data: string): mkm.SymmKey {
        let json = JSON.parse(data)
        this.checkSymmKeyData(json)
        switch (json.algorithm) {
            case 'PLAIN': return PlainKey.getInstance()
            case 'AES': return new mkm.AesSymmKey(json)
            default: throw new CoreError(ProtocolError.SECURE_KEY_FORMAT_INVALID, `build key data: ${JSON.stringify(data)}`)
        }
    }

    private checkSymmKeyData(data: any) {
        if (!data.algorithm || !data.data) {
            throw new CoreError(ProtocolError.SECURE_KEY_FORMAT_INVALID, `check key data: ${JSON.stringify(data)}`)
        }
    }
}

export { KeyCache }