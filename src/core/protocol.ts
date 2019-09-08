import * as mkm from "dim-mkm-js"
import * as dkd from "dim-dkd-js"
import { KeyCache } from './key_cache';
import { Barrack } from './barrack'
import { CoreError, ArgumentError } from './error'

class Protocol implements dkd.Crypto {
    private _sessionKeys: KeyCache = KeyCache.getInstance()

    protected _barrack: Barrack = Barrack.getInstance()

    getSymmetricKey(sender: mkm.ID, receiver: mkm.ID): mkm.SymmKey {
        return this._sessionKeys.getCipherKey(sender, receiver)
    }

    createSymmetricKey(data: string) {
        return this._sessionKeys.createCipherKey(data)
    }

    encryptKey(iMsg: dkd.InstantMessage, key: string): string {
        Protocol.checkNotBroadcast(iMsg)
        // TODO: check whether support reused key
        
        // encrypt with receiver's public key
        let data = Buffer.from(key, 'utf-8')

        // TODO proper way to make the public key has function
        let encryptKey = this.getPublicKeyFromUser(iMsg.receiver)
        return new mkm.RsaPublicKey(encryptKey).encrypt(data).toString('base64')
    }

    private getPublicKeyFromUser(userId: string): mkm.PublicKey {
        let user = this._barrack.getUser(mkm.ID.fromString(userId))
        return user.publicKey
    }
    
    encryptContent(iMsg: dkd.InstantMessage, key: string): string {
        // console.debug(`encryptContent iMsg: ${JSON.stringify(iMsg)}\nkey: ${key}`)
        let symmKey = this.createSymmetricKey(key)
        return symmKey.encrypt(Buffer.from(JSON.stringify(iMsg.content), 'utf-8')).toString('base64')
    }

    decryptKey(sMsg: dkd.SecureMessage, encryptedKey: string, group: string | undefined): string {
        Protocol.checkNotBroadcast(sMsg)
        // decrypt key data with the receiver's private key
        let localUser = this._barrack.getLocalUser(mkm.ID.fromString(sMsg.receiver))
        let key = new mkm.RsaPrivateKey(localUser.privateKey).decrypt(Buffer.from(encryptedKey, 'base64'))
        // console.debug(`decryptKey sMsg: ${JSON.stringify(sMsg)}\nkey: ${key.toString('utf-8')}`)
        return key.toString('utf-8')
    }

    decryptContent(sMsg: dkd.SecureMessage, key: string): dkd.Content {
        // console.debug(`decryptContent sMsg: ${JSON.stringify(sMsg)}\nkey: ${key}`)
        let symmKey = this.createSymmetricKey(key)
        let contentString = symmKey.decrypt(Buffer.from(sMsg.data, 'base64')).toString('utf-8')
        // console.debug(`decryptContent contentString: ${contentString}`)
        let object = JSON.parse(contentString)
        // TODO refactor
        if (!object || !object.type || !object.serialNumber) {
            throw new CoreError(ArgumentError.INVALID_CONTENT)
        }
        return object as dkd.Content
    }

    sign(sMsg: dkd.SecureMessage): string {
        let user = this._barrack.getLocalUser(mkm.ID.fromString(sMsg.sender))
        // console.debug(`sign ${sMsg.data} ${user.privateKey.data}`)
        return new mkm.RsaPrivateKey(user.privateKey).sign(Buffer.from(sMsg.data, 'base64')).toString('base64')
    }

    verify(rMsg: dkd.ReliableMessage): boolean {
        let user = this._barrack.getUser(mkm.ID.fromString(rMsg.sender))
        // console.debug(`verify ${data} ${user.publicKey.data} ${signature}`)
        return new mkm.RsaPublicKey(user.publicKey).verify(Buffer.from(rMsg.data, 'base64'), Buffer.from(rMsg.signature, 'base64'))
    }

    private static isBroadcast(msg: dkd.Message) {
        let receiver
        if (msg.group) {
            receiver = mkm.ID.fromString(msg.group)
        }
        if (!receiver) {
            receiver = mkm.ID.fromString(msg.receiver)
        }
        return receiver.address.isBoardcast()
    }

    private static checkNotBroadcast(msg: dkd.Message) {
        if (Protocol.isBroadcast(msg)) {
            // broadcast message has no key
            throw new CoreError(ArgumentError.BOARDCAST_CANT_ENCRYPT)
        }
    }
}

export { Protocol }