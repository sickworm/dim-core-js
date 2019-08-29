
class CoreError extends Error {
    readonly errorCode: number

    constructor(errorCode: number, errorMsg?: string) {
        if (errorMsg) {
            super(`Storage Error errorCode: ${errorCode}, errorMsg: ${errorMsg}`)
        } else {
            super(`Storage Error errorCode: ${errorCode}`)
        }
        this.errorCode = errorCode
    }
}

class ArgumentError {
    static readonly BOARDCAST_CANT_ENCRYPT = 10000;
    static readonly INVALID_CONTENT = 10001;
}

class StorageError {
    static readonly USER_NOT_FOUND = 20000;
    static readonly LOCAL_USER_NOT_FOUND = 20001;
    static readonly GROUP_NOT_FOUND = 20002;
    static readonly META_NOT_FOUND = 20003;
    static readonly FOUNDER_NOT_FOUND = 20004;
    static readonly OWNER_NOT_FOUND = 20005;
    static readonly PRIVATE_KEY_NOT_FOUND = 20006;
    static readonly PROFILE_NOT_FOUND = 20007;
    static readonly MEMBERS_NOT_FOUND = 20008;
    static readonly SESSION_KEY_NOT_FOUND = 20009;
}

export { CoreError, ArgumentError, StorageError }