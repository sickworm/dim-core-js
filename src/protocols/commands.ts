import * as dkd from 'dim-dkd-js'
import * as mkm from 'dim-mkm-js'

interface Command extends dkd.Content {
    readonly command: string
}

interface HistoryCommand extends Command {
    readonly time: number
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
    readonly message?: string
    readonly sessionKey?: string
    readonly state: HandShakeCommandState
}

interface MetaCommand extends Command {
    readonly identifier: string // mkm.ID
    readonly meta: mkm.Meta
}

interface ProfileCommand extends Command {
    readonly profile: mkm.Profile
}

interface ReceiptCommand extends Command {
    readonly envelope: dkd.Envelope
    readonly signature: string
}

interface SearchCommand extends Command {
    readonly signature: string
}

// module Command {
//     export 
// }

export { Command, HistoryCommand, MetaCommand, ProfileCommand, ReceiptCommand }