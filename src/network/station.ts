import * as mkm from 'dim-mkm-js'
import * as dkd from 'dim-dkd-js'

interface ServiceProvider extends mkm.Group {
}

interface Station extends mkm.User {
    host: string
    port: number
    serviceProvider?: ServiceProvider

    didReceivePackage(data: Buffer, server: Station): void
    didSendPackage(data: Buffer, server: Station): void
    didFailToSendPackage(error: Error, data: Buffer, server: Station): void
}

export { Station, ServiceProvider }