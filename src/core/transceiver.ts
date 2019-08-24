import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'
import { CoreError, ArgumentError, StorageError } from './error'
import { Barrack } from './barrack';
import { SessionKeys } from './session_keys';
import { AesSymmKey, PublicKey } from 'dim-mkm-js';

class Transceiver {
    private _transform: dkd.Transform
    private _delegate: TransceiverDelegate
    private _barrack: Barrack
    private _sessionKeys: SessionKeys

    constructor(crypto: dkd.Crypto, delegate: TransceiverDelegate) {
        this._delegate = delegate
        this._transform = new dkd.Transform(crypto)
        this._barrack = Barrack.instance
        this._sessionKeys = new SessionKeys()
    }

    /**
     *  Send message (secured + certified) to target station
     *
     * @param iMsg - instant message
     * @param callback - callback function
     * @param split - if it's a group message, split it before sending out
     * @return NO on data/delegate error
     * @throws NoSuchFieldException when 'group' not found
     * @throws ClassNotFoundException when key algorithm not supported
     */
    async sendMessage(iMsg: dkd.InstantMessage, split: boolean) {
        let receiver = mkm.ID.fromString(iMsg.receiver)
        let groupId = iMsg.content.group && mkm.ID.fromString(iMsg.content.group)
        let rMsg = this.encryptAndSignMessage(iMsg)
        
        let success = false
        if (split && receiver.type.isGroup()) {
            let members = groupId && this._barrack.getMembers(groupId)
            if (!members || members.length <= 0) {
                throw new Error(`receiver group ${receiver.toString()} members invalid`)
            }
            let rels = this._transform.split(rMsg, members.map(m => m.toString()))
            return rels.map(rMsg => this.sendSingleMessage(rMsg))
        } else {
            return [this.sendSingleMessage(rMsg)]
        }
    }

    async sendSingleMessage(rMsg: dkd.ReliableMessage) {
        let json = JSON.stringify(rMsg)
        let data = Buffer.from(json, 'utf-8')
        return this._delegate.sendPackage(data)
    }

    /**
     *  Pack instant message to reliable message for delivering
     *
     * @param iMsg - instant message
     * @return ReliableMessage Object
     * @throws NoSuchFieldException when encrypt message content
     */
    encryptAndSignMessage(iMsg: dkd.InstantMessage): dkd.ReliableMessage {
        let receiver = mkm.ID.fromString(iMsg.receiver)
        let groupId = iMsg.content.group && mkm.ID.fromString(iMsg.content.group)

        if (groupId) {
            // if 'group' exists and the 'receiver' is a group ID,
            // they must be equal
        } else {
            if (receiver.type.isGroup()) {
                groupId = receiver
            }
        }

        // 1. encrypt 'content' to 'data' for receiver
        let sMsg;
        if (groupId) {
            let members = []
            if (receiver.type.isCommunicator()) {
                members.push(receiver)
            } else {
                let group = this._barrack.getGroup(groupId)
                let members = this._barrack.getMembers(groupId)
                if (!members) {
                    throw Error(`no memebers for group ${groupId}`)
                }
            }
            sMsg = this._transform.encrypt(iMsg, this.getKey(groupId).data, members.map(m => m.toString()))
        } else {
            sMsg = this._transform.encrypt(iMsg, this.getKey(receiver).data)
        }
        return this._transform.sign(sMsg)
    }

    /**
     *  Extract instant message from a reliable message received
     *
     * @param rMsg - reliable message
     * @param users - my accounts
     * @return InstantMessage object
     * @throws IOException when saving meta
     * @throws ClassNotFoundException when creating meta
     */
    verifyAndDecryptMessage(rMsg: dkd.ReliableMessage, users: mkm.User[]): dkd.InstantMessage {
        let sender = mkm.ID.fromString(rMsg.sender)
        let receiver = mkm.ID.fromString(rMsg.receiver)

        // [Meta Protocol] check meta in first contact message
        let meta = this._barrack.getMeta(sender)
        if (!meta) {
            meta = rMsg.meta
            if (!meta.matches(sender)) {
                throw new Error(`meta not match ${meta}, ${sender.toString()}`)
            }
            this._barrack.addMeta(meta, sender)
        }

        let groupId = rMsg.content.group && mkm.ID.fromString(rMsg.content.group)
        let user
        if (receiver.type.isGroup()) {
            groupId = receiver
            // FIXME: maybe other user?
            user = users[0]
            receiver = user.identifier
        } else {
            user = users.find(u => u.identifier.equals(receiver))
        }
        if (!user) {
            throw new Error(`wrong recipient ${receiver.toString()}`)
        }

        // 1. verify 'data' with 'signature'
        let sMsg = this._transform.verify(rMsg)

        // 2. decrypt 'data' to 'content'
        let iMsg
        if (groupId) {
            sMsg = this._transform.trim(sMsg, user.identifier.toString())
            iMsg = this._transform.decrypt(sMsg, receiver.toString())
        } else {
            iMsg = this._transform.decrypt(sMsg)
        }

        // 3. check: top-secret message
        if (iMsg.content.type === dkd.MessageType.Forward) {
            // do it again to drop the wrapper,
            // the secret inside the content is the real message
            let content = iMsg.content.forward
            rMsg = content.forwardMessage
            return this.verifyAndDecryptMessage(rMsg, users)
        }

        return iMsg
    }


    private getKey(receiver: mkm.ID) {
        let user = this._sessionKeys.currentUser
        if (!user) {
            throw Error('sessionKey currentUser not set')
        }
        let sender = user.identifier
        return this._sessionKeys.getKey(sender, receiver)
    }
}

class TransceiverCrypto implements dkd.Crypto {
    private _barrack: Barrack = Barrack.instance

    encryptKey(iMsg: dkd.InstantMessage, key: string, receiver: string): string {
        TransceiverCrypto.checkNotBroadcast(iMsg)
        // TODO: check whether support reused key
        
        // encrypt with receiver's public key
        let data = Buffer.from(key, 'utf-8')

        let encryptKey = this.getPublicKeyFromUser(receiver)
        return encryptKey.encrypt(data).toString('base64')
    }

    private getPublicKeyFromUser(userId: string): PublicKey {
        let user = this._barrack.getUser(mkm.ID.fromString(userId))
        if (!user) {
            throw new CoreError(StorageError.USER_NOT_FOUND)
        }
        if (user.publicKey) {
            return user.publicKey
        }

        // TODO optimize to user.publicKey
        let profile = this._barrack.getProfile(user)
        let encryptKey
        if (profile) {
            encryptKey = profile.key
        } else {
            encryptKey = this._barrack.getMeta(user).publicKey
        }
        return encryptKey
    }
    
    encryptContent(iMsg: dkd.InstantMessage, content: dkd.Content, key: string): string {
        let symmKey = AesSymmKey.fromString(key)
        return symmKey.encrypt(Buffer.from(JSON.stringify(content), 'utf-8')).toString('base64')
    }

    decryptKey(sMsg: dkd.SecureMessage, encryptedKey: string, sender: string, receiver: string, group: string | undefined): string {
        TransceiverCrypto.checkNotBroadcast(sMsg)
        let from = mkm.ID.fromString(sender)
        let to = mkm.ID.fromString(receiver)

        // decrypt key data with the receiver's private key
        let localUser = this._barrack.getLocalUser(sMsg.envelope.receiver)
        if (!localUser) {
            throw new CoreError(StorageError.USER_NOT_FOUND)
        }
        let key = localUser.privateKey.decrypt(Buffer.from(encryptedKey, 'base64'))
        return key.toString('utf-8')
    }

    decryptContent(sMsg: dkd.SecureMessage, encryptedContent: string, key: string): dkd.Content {
        let symmKey = mkm.AesSymmKey.fromString(key)
        let contentString = symmKey.decrypt(Buffer.from(encryptedContent, 'base64')).toString('utf-8')
        let object = JSON.parse(contentString)
        // TODO refactor
        if (!object || !object.type || !object.serialNumber || !object.group) {
            throw new CoreError(ArgumentError.INVALID_CONTENT)
        }
        return object as dkd.Content
    }

    sign(sMsg: dkd.SecureMessage, data: string, sender: string): string {
        let user = this._barrack.getLocalUser(mkm.ID.fromString(sender))
        if (user == null) {
            throw new CoreError(StorageError.USER_NOT_FOUND)
        }
        return user.privateKey.sign(Buffer.from(data, 'utf-8')).toString('base64')
    }

    verify(rMsg: dkd.ReliableMessage, data: string, signature: string, sender: string): boolean {
        let user = this._barrack.getUser(mkm.ID.fromString(sender))
        return user.publicKey.verify(Buffer.from(data, 'utf-8'), Buffer.from(signature, 'base64'))
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
        if (TransceiverCrypto.isBroadcast(msg)) {
            // broadcast message has no key
            throw new CoreError(ArgumentError.BOARDCAST_CANT_ENCRYPT)
        }
    }
}

interface TransceiverDelegate {
    /**
     *  Send out a data package onto network
     *
     * @param data - package`
     * @param handler - completion handler
     * @return NO on data/delegate error
     */
    sendPackage(data: Buffer): Promise<void>

    /**
     *  Update/create cipher key for encrypt message content
     *
     * @param sender - user identifier
     * @param receiver - contact/group identifier
     * @param reusedKey - old key (nullable)
     * @return new key
     */
    reuseCipherKey(sender: mkm.ID, receiver: mkm.ID, reusedKey: mkm.SymmKey): mkm.SymmKey

    /**
     *  Upload encrypted data to CDN
     *
     * @param data - encrypted file data
     * @param iMsg - instant message
     * @return download URL
     */
    uploadFileData(data: Buffer, iMsg: dkd.InstantMessage): Promise<string>
    
    /**
     *  Download encrypted data from CDN, and decrypt it when finished
     *
     * @param url - download URL
     * @param iMsg - instant message
     * @return encrypted file data
     */
    downloadFileData(url: string, iMsg: dkd.InstantMessage): Promise<Buffer>
}

export { Transceiver, TransceiverDelegate }