import * as mkm from "dim-mkm-js"

class SessionKeys extends Map<string, Map<string, mkm.SymmKey>> {

    public getKey(sender: mkm.Address, receiver: mkm.Address): mkm.SymmKey {
        let senderKeys = this.get(sender.string)
        if (!senderKeys) {
            throw new Error(`session key not exists for sender: ${sender.string}`)
        }
        let key = senderKeys.get(receiver.string)
        if (!key) {
            throw new Error(`session key not exists for sender: ${sender.string}, receiver: ${receiver.string}`)
        }
        return key
    }

    public setKey(key: mkm.SymmKey, sender: mkm.Address, receiver: mkm.Address) {
        let senderKeys = this.get(sender.string)
        if (!senderKeys) {
            senderKeys = new Map()
            this.set(sender.string, senderKeys)
        }
        senderKeys.set(receiver.string, key)
    }
}