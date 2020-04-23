import { createHash } from 'crypto'
import { lstat, pathExists, readdir, readFile, Stats } from 'fs-extra'
import { Module, Type, TypeMetadata } from 'helios-distribution-types'
import { resolve } from 'path'
import { BaseModelStructure } from '../basemodel.struct'

export abstract class ModuleStructure extends BaseModelStructure<Module> {

    constructor(
        absoluteRoot: string,
        relativeRoot: string,
        structRoot: string,
        baseUrl: string,
        protected type: Type
    ) {
        super(absoluteRoot, relativeRoot, structRoot, baseUrl)
    }

    public async getSpecModel(): Promise<Module[]> {
        if (this.resolvedModels == null) {
            this.resolvedModels = await this._doModuleRetrieval()
        }

        return this.resolvedModels
    }

    protected generateMavenIdentifier(name: string, version: string): string {
        return `generated.${this.type.toLowerCase()}:${name}:${version}@${TypeMetadata[this.type].defaultExtension}`
    }

    protected async abstract getModuleId(name: string, path: string, stats: Stats, buf: Buffer): Promise<string>
    protected async abstract getModuleName(name: string, path: string, stats: Stats, buf: Buffer): Promise<string>
    protected async abstract getModuleUrl(name: string, path: string, stats: Stats): Promise<string>
    protected async abstract getModulePath(name: string, path: string, stats: Stats): Promise<string | null>

    protected async parseModule(file: string, filePath: string, stats: Stats): Promise<Module> {
        const buf = await readFile(filePath)
        const mdl: Module = {
            id: await this.getModuleId(file, filePath, stats, buf),
            name: await this.getModuleName(file, filePath, stats, buf),
            type: this.type,
            required: {
                value: true,
                def: true
            },
            artifact: {
                size: stats.size,
                MD5: createHash('md5').update(buf).digest('hex'),
                url: await this.getModuleUrl(file, filePath, stats)
            }
        }
        const pth = await this.getModulePath(file, filePath, stats)
        if (pth) {
            mdl.artifact.path = pth
        }
        return mdl
    }

    private async _doModuleRetrieval(): Promise<Module[]> {

        const accumulator: Module[] = []

        if (await pathExists(this.containerDirectory)) {
            const files = await readdir(this.containerDirectory)
            for (const file of files) {
                const filePath = resolve(this.containerDirectory, file)
                const stats = await lstat(filePath)
                if (stats.isFile()) {
                    accumulator.push(await this.parseModule(file, filePath, stats))
                }
            }
        }

        return accumulator

    }

}
