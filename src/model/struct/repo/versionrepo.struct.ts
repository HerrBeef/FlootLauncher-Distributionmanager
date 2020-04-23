import { join } from 'path'
import { resolve as resolveURL } from 'url'
import { BaseFileStructure } from '../BaseFileStructure'

export class VersionRepoStructure extends BaseFileStructure {

    constructor(
        absoluteRoot: string,
        relativeRoot: string
    ) {
        super(absoluteRoot, relativeRoot, 'versions')
    }

    public getFileName(minecraftVersion: string, forgeVersion: string): string {
        return `${minecraftVersion}-forge-${forgeVersion}`
    }

    public getVersionManifest(minecraftVersion: string, forgeVersion: string): string {
        const fileName = this.getFileName(minecraftVersion, forgeVersion)
        return join(this.containerDirectory, fileName, `${fileName}.json`)
    }

    public getVersionManifestURL(url: string, minecraftVersion: string, forgeVersion: string): string {
        const fileName = this.getFileName(minecraftVersion, forgeVersion)
        return resolveURL(url, join(this.relativeRoot, fileName, `${fileName}.json`))
    }

}
