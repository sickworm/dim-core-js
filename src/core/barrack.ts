import * as mkm from 'dim-mkm-js'

class RamDataSource {
    private map: Map<string, Map<string, string>>

    public constructor() {
        this.map = new Map()
    }

    get(dbName: string, id: any): any {
        let db = this.map.get(dbName)
        if (db === undefined) {
            return undefined
        }

        // mkm.Entity
        if (id.identifier) {
            id = id.identifier.string
        } else if (id.string) {
            // mkm.ID
            id = id.string
        }
        if (typeof id !== 'string') {
            id = JSON.stringify(id)
        }
        return JSON.parse(db.get(id) || 'undefined')
    }

    set(dbName: string, id: any, value: any): any {
        let db = this.map.get(dbName)
        if (db === undefined) {
            db = new Map()
            this.map.set(dbName, db)
        }

        if (id.identifier) {
            // mkm.Entity
            id = id.identifier.string
        } else if (id.string) {
            // mkm.ID
            id = id.string
        }
        if (typeof id !== 'string') {
            id = JSON.stringify(id)
        }
        return db.set(id, JSON.stringify(value))
    }
}

class Barrack extends RamDataSource
    implements mkm.MetaDataSource, mkm.EntityDataSource, mkm.UserDataSource, mkm.GroupDataSource {

    private static _instance: Barrack

    public constructor() {
        if (Barrack._instance) {
            super()
            Barrack._instance = this
        }
        return Barrack._instance
    }

    public addUser(user: mkm.User): void {
        this.set('user', user.identifier.address, user)
    }

    public getUser(identifier: mkm.ID): mkm.User {
        return this.get('user', identifier)
    }

    public addLocalUser(user: mkm.LocalUser): void {
        this.set('local_user', user.identifier.address, user)
    }

    public getLocalUser(identifier: mkm.ID): mkm.LocalUser {
        return this.get('local_user', identifier)
    }

    public addGroup(group: mkm.Group): void {
        this.set('group', group.identifier.address, group)
    }

    public getGroup(identifier: mkm.ID): mkm.Group {
        return this.get('group', identifier)
    }

    public addMeta(meta: mkm.Meta, identifier: mkm.ID): void {
        this.set('meta', identifier.address, meta)
    }

    public getMeta(key: mkm.ID | mkm.Entity): mkm.Meta {
        if ('identifier' in key) {
            key = key.identifier
        }
        return this.get('meta', key)
    }

    public getFounder(group: mkm.Group | mkm.ID): mkm.ID {
        return this.get('founder', group)
    }

    public getOwner(group: mkm.Group | mkm.ID): mkm.ID {
        return this.get('owner', group)
    }

    public getMembers(group: mkm.Group | mkm.ID): mkm.ID[] {
        return this.get('members', group)
    }

    public getPrivateKey(user: mkm.LocalUser | mkm.User | mkm.ID): mkm.PrivateKey {
        return this.get('privateKey', user)
    }

    public getContacts(user: mkm.LocalUser | mkm.User | mkm.ID): mkm.ID[] {
        return this.get('contacts', user)
    }

    public getProfile(entity: mkm.LocalUser | mkm.User | mkm.ID): mkm.Profile {
        return this.get('profile', entity)
    }

    public getName(entity: mkm.Entity | mkm.ID): string {
        return this.get('name', entity)
    }
}

export { Barrack }