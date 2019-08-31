import * as mkm from "dim-mkm-js"
import * as dkd from "dim-dkd-js"
import { KeyCache } from './key_cache';
import { Barrack } from './barrack'
import { CoreError, ArgumentError } from './error'

class Protocol implements dkd.Crypto {
    private _sessionKeys: KeyCache = KeyCache.getInstance()

    protected _barrack: Barrack = Barrack.getInstance()

    getSymmetricKey(sender: mkm.ID, receiver: mkm.ID) {
        return this._sessionKeys.getCipherKey(sender, receiver)
    }

    createSymmetricKey(data: any) {
        return this._sessionKeys.createCipherKey(data)
    }

    encryptKey(iMsg: dkd.InstantMessage, key: string, receiver: string): string {
        Protocol.checkNotBroadcast(iMsg)
        // TODO: check whether support reused key
        
        // encrypt with receiver's public key
        let data = Buffer.from(key, 'utf-8')

        // TODO proper way to make the public key has function
        let encryptKey = this.getPublicKeyFromUser(receiver)
        return new mkm.RsaPublicKey(encryptKey).encrypt(data).toString('base64')
    }

    private getPublicKeyFromUser(userId: string): mkm.PublicKey {
        let user = this._barrack.getUser(mkm.ID.fromString(userId))
        return user.publicKey
    }
    
    encryptContent(iMsg: dkd.InstantMessage, content: dkd.Content, key: string): string {
        let symmKey = this.createSymmetricKey(key)
        return symmKey.encrypt(Buffer.from(JSON.stringify(content), 'utf-8')).toString('base64')
    }

    decryptKey(sMsg: dkd.SecureMessage, encryptedKey: string, sender: string, receiver: string, group: string | undefined): string {
        Protocol.checkNotBroadcast(sMsg)
        let from = mkm.ID.fromString(sender)
        let to = mkm.ID.fromString(receiver)

        // decrypt key data with the receiver's private key
        let localUser = this._barrack.getLocalUser(sMsg.envelope.receiver)
        let key = new mkm.RsaPrivateKey(localUser.privateKey).decrypt(Buffer.from(encryptedKey, 'base64'))
        return key.toString('utf-8')
    }

    decryptContent(sMsg: dkd.SecureMessage, encryptedContent: string, key: string): dkd.Content {
        let symmKey = this.createSymmetricKey(key)
        let contentString = symmKey.decrypt(Buffer.from(encryptedContent, 'base64')).toString('utf-8')
        let object = JSON.parse(contentString)
        // TODO refactor
        if (!object || !object.type || !object.serialNumber) {
            throw new CoreError(ArgumentError.INVALID_CONTENT)
        }
        return object as dkd.Content
    }

    sign(sMsg: dkd.SecureMessage, data: string, sender: string): string {
        let user = this._barrack.getLocalUser(mkm.ID.fromString(sender))
        console.debug(`sign ${data} ${user.privateKey.data}`)
        return new mkm.RsaPrivateKey(user.privateKey).sign(Buffer.from(data, 'utf-8')).toString('base64')
    }

    verify(rMsg: dkd.ReliableMessage, data: string, signature: string, sender: string): boolean {
        let user = this._barrack.getUser(mkm.ID.fromString(sender))
        console.debug(`verify ${data} ${user.publicKey.data} ${signature}`)
        return new mkm.RsaPublicKey(user.publicKey).verify(Buffer.from(data, 'utf-8'), Buffer.from(signature, 'base64'))
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