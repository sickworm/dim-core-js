import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'
import { Barrack } from './barrack';
import { SessionKeys } from './session_keys';

class Transceiver {
    private _transform: dkd.Transform
    private _barrack: Barrack
    private _sessionKeys: SessionKeys

    public constructor(crypto: dkd.Crypto) {
        this._transform = new dkd.Transform(crypto)
        this._barrack = new Barrack()
        this._sessionKeys = new SessionKeys()
    }

    public async sendMessage(ins: dkd.InstantMessage, split: boolean) {
        let receiver = mkm.ID.fromString(ins.receiver)
        let groupId = ins.content.group && mkm.ID.fromString(ins.content.group)
        let rel = this.encryptAndSignMessage(ins)
    }

    public encryptAndSignMessage(ins: dkd.InstantMessage): dkd.ReliableMessage {
        let receiver = mkm.ID.fromString(ins.receiver)
        let groupId = ins.content.group && mkm.ID.fromString(ins.content.group)

        if (groupId) {
            // if 'group' exists and the 'receiver' is a group ID,
            // they must be equal
        } else {
            if (mkm.NetworkType.isGroup(receiver.type)) {
                groupId = receiver;
            }
        }

        // 1. encrypt 'content' to 'data' for receiver
        if (groupId) {
            let members = []
            if (mkm.NetworkType.isCommunicator(receiver.type)) {
                members.push(receiver)
            } else {
                let group = this._barrack.getGroup(groupId)
                let members = this._barrack.getMembers(group)
                if (!members) {
                    throw Error(`no memebers for group ${groupId}`)
                }
            }
            // return this._transform.encrypt(ins, this.getKey(groupId).data, members)
        }
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