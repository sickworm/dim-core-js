
class CoreError extends Error {
    readonly errorCode: number

    constructor(errorCode: number, errorMsg?: string) {
        if (errorMsg) {
            super(`Core Error errorCode: ${errorCode}, errorMsg: ${errorMsg}`)
        } else {
            super(`Core Error errorCode: ${errorCode}`)
        }
        this.errorCode = errorCode
    }
}

class ArgumentError {
    static readonly BOARDCAST_CANT_ENCRYPT = 10000;
    static readonly INVALID_CONTENT = 10001;
}

class StorageError {
    static readonly USER_NOT_FOUND = 11000;
    static readonly LOCAL_USER_NOT_FOUND = 11001;
    static readonly GROUP_NOT_FOUND = 11002;
    static readonly META_NOT_FOUND = 11003;
    static readonly FOUNDER_NOT_FOUND = 11004;
    static readonly OWNER_NOT_FOUND = 11005;
    static readonly PRIVATE_KEY_NOT_FOUND = 11006;
    static readonly PROFILE_NOT_FOUND = 11007;
    static readonly MEMBERS_NOT_FOUND = 11008;
    static readonly SESSION_KEY_NOT_FOUND = 11009;
}

class ProtocolError {
    static readonly SECURE_KEY_FORMAT_INVALID = 12000;
}

export { CoreError, ArgumentError, StorageError, ProtocolError }