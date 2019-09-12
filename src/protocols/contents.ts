import * as dkd from "dim-dkd-js"
import * as mkm from "dim-mkm-js"

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

interface PageContentData {
    url: string
    title: string
    desc: string
    icon: string // base64
}

interface PageContent extends dkd.Content, PageContentData {
}

interface FileContentData {
    url: string
    data: string // base64
    fileName: string
    password: string // symmetric key to decrypt the encrypted data from URL
}

interface FileContent extends dkd.Content, FileContentData {
}

interface AudioContent extends FileContent {
}

interface ImageContentData extends FileContentData {
    thumbnail: String
}

interface ImageContent extends dkd.Content, ImageContentData {
}

interface VideoContentData extends FileContentData {
    snapshot: string // url
}

interface VideoContent extends dkd.Content, ImageContentData {
}

interface ForwardContent extends dkd.Content {
    forward: dkd.ReliableMessage
}

module Content {
    export function text(text: string): TextContent {
        return {
            type: dkd.MessageType.Text,
            sn: mkm.Crypto.randomInt(),
            text
        }
    }

    export function page(pageData: PageContentData): PageContent {
        return Object.assign({
            type: dkd.MessageType.Text,
            sn: mkm.Crypto.randomInt()
        }, pageData)
    }

    export function file(fileData: FileContentData): FileContent {
        return Object.assign({
            type: dkd.MessageType.File,
            sn: mkm.Crypto.randomInt()
        }, fileData)
    }

    export function audio(fileData: FileContentData): FileContent {
        return Object.assign({
            type: dkd.MessageType.Audio,
            sn: mkm.Crypto.randomInt()
        }, fileData)
    }

    export function image(fileData: ImageContentData): FileContent {
        return Object.assign({
            type: dkd.MessageType.Image,
            sn: mkm.Crypto.randomInt()
        }, fileData)
    }

    export function video(fileData: VideoContentData): FileContent {
        return Object.assign({
            type: dkd.MessageType.Video,
            sn: mkm.Crypto.randomInt()
        }, fileData)
    }

    export function forward(message: dkd.ReliableMessage): ForwardContent {
        return {
            type: dkd.MessageType.Forward,
            sn: mkm.Crypto.randomInt(),
            forward: message
        }
    }
}

export { Content, TextContent, FileContent, AudioContent, ImageContent, VideoContent, ForwardContent }