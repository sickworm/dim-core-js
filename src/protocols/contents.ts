import * as dkd from "dim-dkd-js"

// dkd.MessageType
//
// enum MessageType {
//     Text = 0x01,     // 0000 0001

//     File = 0x10,     // 0001 0000
//     Image = 0x12,    // 0001 0010
//     Audio = 0x14,    // 0001 0100
//     Video = 0x16,    // 0001 0110

//     Page = 0x20,     // 0010 0000

//     Command = 0x88,  // 1000 1000
//     History = 0x89,  // 1000 1001 (Entity history command)

//     // top-secret message forward by proxy (Service Provider)
//     Forward = 0xFF,  // 1111 1111
// }

interface TextContent extends dkd.Content {
    text: string
}

interface PageContent extends dkd.Content {
    url: string
    title: string
    desc: string
    icon: string // base64
}

interface FileContent extends dkd.Content {
    url: string
    data: string // base64
    fileName: string
    password: string // symmetric key to decrypt the encrypted data from URL
}

interface AudioContent extends FileContent {
}

interface ImageContent extends FileContent {
    thumbnail: String
}

interface VideoContent extends FileContent {
    snapshot: string // base64
}

export { }