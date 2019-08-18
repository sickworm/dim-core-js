import * as mkm from "dim-mkm-js"

class SessionKeys extends Map<string, Map<string, mkm.SymmKey>> {
    private static _instance: SessionKeys

    currentUser?: mkm.User

    public constructor() {
        if (!SessionKeys._instance) {
            super()
            SessionKeys._instance = this
        }
        return SessionKeys._instance
    }

    public getKey(sender: mkm.Address | mkm.ID, receiver: mkm.Address | mkm.ID): mkm.SymmKey {
        if (sender instanceof mkm.ID) {
            sender = sender.address
        }
        if (receiver instanceof mkm.ID) {
            receiver = receiver.address
        }
        
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

export { SessionKeys }