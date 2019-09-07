import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'
import { CoreError, ArgumentError, StorageError } from './error'
import { Barrack } from './barrack';
import { AesSymmKey, PublicKey } from 'dim-mkm-js';
import { deprecate } from 'util';
import { verify } from 'crypto';
import { Protocol} from './protocol'

class Transceiver extends Protocol {
    private _transform: dkd.Transform
    private _delegate: TransceiverDelegate

    constructor(delegate: TransceiverDelegate) {
        super()
        this._delegate = delegate
        this._transform = new dkd.Transform(this)
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
        let sender = mkm.ID.fromString(iMsg.sender);

        let group = null
        if (receiver.type.isGroup()) {
            group = this._barrack.getGroup(receiver)
        } else {
            let groupId = iMsg.content.group
            if (groupId) {
                group = this._barrack.getGroup(groupId)
            }
        }

        // 1. encrypt 'content' to 'data' for receiver
        let sMsg
        if (group == null) {
            // personal message
            sMsg = this._transform.encrypt(iMsg, JSON.stringify(this.getSymmetricKey(sender, receiver)))
        } else {
            // group message
            let groupId = group.identifier
            let members = []
            if (receiver.type.isCommunicator()) {
                members.push(receiver)
            } else {
                let group = this._barrack.getGroup(groupId)
                let members = this._barrack.getMembers(groupId)
            }
            sMsg = this._transform.encrypt(iMsg, this.getSymmetricKey(sender, groupId).data, members.map(m => m.toString()))
        }

        // 2. sign 'data' by sender
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
     * 
     * @deprecate
     */
    verifyAndDecryptMessageDeprecate(rMsg: dkd.ReliableMessage, users: mkm.User[]): dkd.InstantMessage {
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
            return this.verifyAndDecryptMessageDeprecate(rMsg, users)
        }

        return iMsg
    }

    verifyAndDecryptMessage(rMsg: dkd.ReliableMessage): dkd.InstantMessage {
        return this._transform.decrypt(this._transform.verify(rMsg))
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