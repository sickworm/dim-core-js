import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'

class Transceiver {
    transform: dkd.Transform

    public constructor(crypto: Crypto) {
        this.transform = new dkd.Transform(crypto)
    }

    public async sendMessage(ins: dkd.InstantMessage, split: boolean) {
        let receiver = Object.assign({}, ins.receiver)
        let groupId = Object.assign({}, ins.content.group)
        let rel = this.encryptAndSignMessage(ins)
    }

    public encryptAndSignMessage(ins: dkd.InstantMessage): dkd.ReliableMessage {
        let receiver = Object.assign({}, ins.receiver)
        let groupId = Object.assign({}, ins.content.group)

        if (groupId != null) {
            // if 'group' exists and the 'receiver' is a group ID,
            // they must be equal
        } else {
        }
    }
}