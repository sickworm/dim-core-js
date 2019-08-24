import * as mkm from 'dim-mkm-js'
import { CoreError, StorageError } from "./error"

interface DataSource {
    get(dbName: string, id: any): any
    set(dbName: string, id: any, value: any): any
}

class RamDataSource implements DataSource {
    private map: Map<string, Map<string, string>>

    public constructor() {
        this.map = new Map()
    }

    get(dbName: string, id: any): any {
        let db = this.map.get(dbName)
        if (db === undefined || db === null) {
            return null
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
        return JSON.parse(db.get(id) || 'null')
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

class Barrack
    implements mkm.MetaDataSource, mkm.EntityDataSource, mkm.UserDataSource, mkm.GroupDataSource {

    public static instance: Barrack = new Barrack()
    
    private _implement: DataSource

    private constructor() {
        this._implement = new RamDataSource()
    }

    public addUser(user: mkm.User): void {
        this._implement.set('user', user.identifier.address, user)
    }

    public getUser(identifier: mkm.ID): mkm.User {
        return this.getOrError('user', identifier, StorageError.USER_NOT_FOUND)
    }

    public addLocalUser(localUser: mkm.LocalUser): void {
        let user: mkm.User = { identifier: localUser.identifier, publicKey: localUser.publicKey }
        this._implement.set('user', user.identifier.address, user)
        this._implement.set('local_user', user.identifier.address, localUser)
    }

    public getLocalUser(identifier: mkm.ID): mkm.LocalUser {
        return this.getOrError('local_user', identifier, StorageError.LOCAL_USER_NOT_FOUND)
    }

    public addGroup(group: mkm.Group): void {
        this._implement.set('group', group.identifier.address, group)
    }

    public getGroup(identifier: mkm.ID): mkm.Group {
        return this.getOrError('group', identifier, StorageError.GROUP_NOT_FOUND)
    }

    public addMeta(meta: mkm.Meta, identifier: mkm.ID): void {
        this._implement.set('meta', identifier.address, meta)
    }

    public getMeta(key: mkm.ID | mkm.Entity): mkm.Meta {
        if ('identifier' in key) {
            key = key.identifier
        }
        return this.getOrError('meta', key, StorageError.META_NOT_FOUND)
    }

    public getFounder(group: mkm.Group | mkm.ID): mkm.ID {
        if ('identifier' in group) {
            group = group.identifier
        }
        return this.getOrError('founder', group, StorageError.FOUNDER_NOT_FOUND)
    }

    public getOwner(group: mkm.Group | mkm.ID): mkm.ID {
        if ('identifier' in group) {
            group = group.identifier
        }
        return this.getOrError('owner', group, StorageError.OWNER_NOT_FOUND)
    }

    public getMembers(group: mkm.Group | mkm.ID): mkm.ID[] {
        if ('identifier' in group) {
            group = group.identifier
        }
        return this.getOrEmpty('members', group)
    }

    public getPrivateKey(user: mkm.LocalUser | mkm.ID): mkm.PrivateKey {
        if ('identifier' in user) {
            user = user.identifier
        }
        return this.getOrError('privateKey', user, StorageError.PRIVATE_KEY_NOT_FOUND)
    }

    public getContacts(user: mkm.LocalUser | mkm.User | mkm.ID): mkm.ID[] {
        if ('identifier' in user) {
            user = user.identifier
        }
        return this.getOrEmpty('contacts', user)
    }

    public getProfile(entity: mkm.Entity | mkm.ID): mkm.Profile {
        if ('identifier' in entity) {
            entity = entity.identifier
        }
        return this.getOrError('profile', entity, StorageError.PROFILE_NOT_FOUND)
    }

    public getName(entity: mkm.Entity | mkm.ID): string {
        return this.getProfile(entity).name
    }

    private getOrError(dbName: string, key: any, errorCode: number): any {
        let object = this._implement.get(dbName, key)
        if (object == null) {
            throw new CoreError(errorCode)
        }
        return object
    }

    private getOrEmpty(dbName: string, key: any): any {
        let object = this._implement.get(dbName, key)
        if (object == null) {
            return []
        }
        return object
    }
}

export { Barrack }