import * as mkm from 'dim-mkm-js'

class RamDataSource {
    private map: Map<string, Map<string, string>>

    public constructor() {
        this.map = new Map();
    }

    get(dbName: string, id: any): any {
        let db = this.map.get(dbName)
        if (db === undefined) {
            return undefined
        }

        if (typeof id !== 'string') {
            id = JSON.stringify(id);
        }
        return JSON.parse(db.get(id) || "undefined");
    }

    set(dbName: string, id: any, value: any): any {
        let db = this.map.get(dbName)
        if (db === undefined) {
            db = new Map();
            this.map.set(dbName, db);
        }

        if (typeof id !== 'string') {
            id = JSON.stringify(id);
        }
        return db.set(id, JSON.stringify(value));
    }
}

class Barrack extends RamDataSource
    implements mkm.MetaDataSource, mkm.EntityDataSource, mkm.UserDataSource, mkm.GroupDataSource {

    public addAccount(account: mkm.Account) {
        this.set("account", account.identifier.address, account);
    }

    public getAccount(identifier: mkm.ID) {
        return this.get("account", identifier);
    }

    public addUser(user: mkm.User) {
        this.set("user", user.identifier.address, user);
    }

    public getUser(identifier: mkm.ID) {
        return this.get("user", identifier);
    }

    public addGroup(group: mkm.Group) {
        this.set("group", group.identifier.address, group);
    }

    public getGroup(identifier: mkm.ID) {
        return this.get("group", identifier);
    }

    public addMeta(meta: mkm.Meta, identifier: mkm.ID) {
        this.set("meta", identifier.address, meta)
    }

    public getMeta(key: mkm.ID | mkm.Entity): mkm.Meta {
        if ('identifier' in key) {
            key = key.identifier
        }
        return this.get('meta', key)
    }

    public getFounder(group: mkm.Group): mkm.ID {
        return this.get('founder', group)
    }

    public getOwner(group: mkm.Group): mkm.ID {
        return this.get('owner', group)
    }

    public getMembers(group: mkm.Group): mkm.ID[] {
        return this.get('members', group)
    }

    public getPrivateKey(user: mkm.User): mkm.PrivateKey {
        return this.get('privateKey', user)
    }

    public getContacts(user: mkm.User): mkm.Account[] {
        return this.get('contacts', user)
    }

    public getProfile(entity: mkm.Entity): mkm.Profile {
        return this.get('profile', entity)
    }

    public getName(entity: mkm.Entity): string {
        return this.get('name', entity)
    }
}