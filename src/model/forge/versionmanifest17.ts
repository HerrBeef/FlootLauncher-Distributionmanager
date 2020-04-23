export interface VersionManifest17 {

    id: string
    time: string
    releaseTime: string
    type: string
    minecraftArguments: string
    mainClass: string
    inheritsFrom: string
    jar: string
    logging: {}
    libraries: Array<{
        name: string
        url?: string
        checksums?: string[]
        serverreq?: boolean
        clientreq?: boolean
        comment?: string
    }>

}
