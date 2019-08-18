
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
    static readonly KEY_NOT_FOUND = 20001;
}

export { CoreError, ArgumentError, StorageError }