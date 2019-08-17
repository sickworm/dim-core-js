import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'
import { Barrack } from './barrack';
import { SessionKeys } from './session_keys';

class Transceiver {
    private _transform: dkd.Transform
    private _delegate: TransceiverDelegate
    private _barrack: Barrack
    private _sessionKeys: SessionKeys

    constructor(crypto: dkd.Crypto, delegate: TransceiverDelegate) {
        this._delegate = delegate
        this._transform = new dkd.Transform(crypto)
        this._barrack = new Barrack()
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
    async sendMessage(ins: dkd.InstantMessage, split: boolean) {
        let receiver = mkm.ID.fromString(ins.receiver)
        let groupId = ins.content.group && mkm.ID.fromString(ins.content.group)
        let rel = this.encryptAndSignMessage(ins)
        
        let success = false
        if (split && receiver.type.isGroup()) {
            let members = groupId && this._barrack.getMembers(groupId)
            if (!members || members.length <= 0) {
                throw new Error(`receiver group ${receiver.toString()} members invalid`)
            }
            let rels = this._transform.split(rel, members.map(m => m.toString()))
            return rels.map(r => this.sendSingleMessage(r))
        } else {
            return [this.sendSingleMessage(rel)]
        }
    }

    async sendSingleMessage(rel: dkd.ReliableMessage) {
        let json = JSON.stringify(rel)
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
    encryptAndSignMessage(ins: dkd.InstantMessage): dkd.ReliableMessage {
        let receiver = mkm.ID.fromString(ins.receiver)
        let groupId = ins.content.group && mkm.ID.fromString(ins.content.group)

        if (groupId) {
            // if 'group' exists and the 'receiver' is a group ID,
            // they must be equal
        } else {
            if (receiver.type.isGroup()) {
                groupId = receiver
            }
        }

        // 1. encrypt 'content' to 'data' for receiver
        let sec;
        if (groupId) {
            let members = []
            if (receiver.type.isCommunicator()) {
                members.push(receiver)
            } else {
                let group = this._barrack.getGroup(groupId)
                let members = this._barrack.getMembers(group)
                if (!members) {
                    throw Error(`no memebers for group ${groupId}`)
                }
            }
            sec = this._transform.encrypt(ins, this.getKey(groupId).data, members.map(m => m.toString()))
        } else {
            sec = this._transform.encrypt(ins, this.getKey(receiver).data)
        }
        return this._transform.sign(sec)
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
    verifyAndDecryptMessage(rel: dkd.ReliableMessage, users: mkm.User[]): dkd.InstantMessage {
        let sender = mkm.ID.fromString(rel.sender)
        let receiver = mkm.ID.fromString(rel.receiver)

        // [Meta Protocol] check meta in first contact message
        let meta = this._barrack.getMeta(sender)
        if (!meta) {
            meta = rel.meta
            if (!meta.matches(sender)) {
                throw new Error(`meta not match ${meta}, ${sender.toString()}`)
            }
            this._barrack.addMeta(meta, sender)
        }

        let groupId = rel.content.group && mkm.ID.fromString(rel.content.group)
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
        let sec = this._transform.verify(rel)

        // 2. decrypt 'data' to 'content'
        let ins
        if (groupId) {
            sec = this._transform.trim(sec, user.identifier.toString())
            ins = this._transform.decrypt(sec, receiver.toString())
        } else {
            ins = this._transform.decrypt(sec)
        }

        // 3. check: top-secret message
        if (ins.content.type === dkd.MessageType.Forward) {
            // do it again to drop the wrapper,
            // the secret inside the content is the real message
            let content = ins.content.forward
            rel = content.forwardMessage
            return this.verifyAndDecryptMessage(rel, users)
        }

        return ins
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
    private _barrack: Barrack = new Barrack()

    encryptKey(msg: dkd.InstantMessage, key: string, receiver: string): Buffer {
        let data = Buffer.from(key, 'utf-8')
        let contact = this._barrack.getAccount(mkm.ID.fromString(receiver))

        // 1. get key for encryption from profile
        let profile = this._barrack.getProfile(contact)
        let meta = this._barrack.getMeta(contact)
        meta.publicKey.verify(contact, )

        return contact.encrypt(data)
    }
    
    encryptContent(msg: dkd.InstantMessage, content: dkd.Content, key: string): Buffer {
        throw new Error("Method not implemented.");
    }

    decryptKey(msg: dkd.SecureMessage, key: Buffer, sender: string, receiver: string, group: string | null): string {
        throw new Error("Method not implemented.");
    }

    decryptContent(msg: dkd.SecureMessage, data: Buffer, key: string): dkd.Content {
        throw new Error("Method not implemented.");
    }

    sign(msg: dkd.SecureMessage, data: Buffer, sender: string): Buffer {
        throw new Error("Method not implemented.");
    }

    verify(msg: dkd.ReliableMessage, data: Buffer, signature: Buffer, sender: string): boolean {
        throw new Error("Method not implemented.");
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
    uploadFileData(data: Buffer, ins: dkd.InstantMessage): Promise<string>
    
    /**
     *  Download encrypted data from CDN, and decrypt it when finished
     *
     * @param url - download URL
     * @param iMsg - instant message
     * @return encrypted file data
     */
    downloadFileData(url: string, ins: dkd.InstantMessage): Promise<Buffer>
}

export { Transceiver, TransceiverDelegate }