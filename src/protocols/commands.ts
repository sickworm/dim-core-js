import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'

interface Command extends dkd.Content {
    command: string
}

interface HistoryCommand extends Command {
    time: number
}

// TODO add readOnly for all data structure in dim-core
enum HandShakeCommandState {
    INIT    = 0,
    START   = 1,  // C -> S, without session key(or session expired)
    AGAIN   = 2,  // S -> C, with new session key
    RESTART = 3,  // C -> S, with new session key
    SUCCESS = 4  // S -> C, handshake accepted
}

interface HandShakeCommand extends Command {
        message?: string
        sessionKey?: string
        state: HandShakeCommandState
}

interface MetaCommand extends Command {
    identifier: string // mkm.ID
    meta: mkm.Meta
}

interface ProfileCommand extends Command {
    profile: mkm.Profile
}

interface ReceiptCommand extends Command {
    envelope: dkd.Envelope
    signature: string
}

export { Command, HistoryCommand, MetaCommand, ProfileCommand, ReceiptCommand }