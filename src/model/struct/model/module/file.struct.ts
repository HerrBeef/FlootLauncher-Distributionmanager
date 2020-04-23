/* eslint-disable @typescript-eslint/no-unused-vars */
import { Stats } from 'fs'
import { Type, Module } from 'helios-distribution-types'
import { resolve as resolveURL } from 'url'
import { ModuleStructure } from './module.struct'
import { readdir, stat } from 'fs-extra'
import { join, resolve, sep } from 'path'

export class MiscFileStructure extends ModuleStructure {

    constructor(
        absoluteRoot: string,
        relativeRoot: string,
        baseUrl: string
    ) {
        super(absoluteRoot, relativeRoot, 'files', baseUrl, Type.File)
    }

    public async getSpecModel(): Promise<Module[]> {
        if (this.resolvedModels == null) {
            this.resolvedModels = await this.recursiveModuleScan(this.containerDirectory)
        }

        return this.resolvedModels
    }

    protected async recursiveModuleScan(dir: string): Promise<Module[]> {
        let acc: Module[] = []
        const subdirs = await readdir(dir)
        for (const file of subdirs) {
            const filePath = resolve(dir, file)
            const stats = await stat(filePath)
            if (stats.isDirectory()) {
                acc = acc.concat(await this.recursiveModuleScan(filePath))
            } else {
                acc.push(await this.parseModule(file, filePath, stats))
            }
        }
        return acc
    }

    protected async getModuleId(name: string, path: string, stats: Stats, buf: Buffer): Promise<string> {
        return name
    }
    protected async getModuleName(name: string, path: string, stats: Stats, buf: Buffer): Promise<string> {
        return name
    }
    protected async getModuleUrl(name: string, path: string, stats: Stats): Promise<string> {
        return resolveURL(this.baseUrl, join(this.relativeRoot, ...path.substr(this.containerDirectory.length+1).split(sep)))
    }
    protected async getModulePath(name: string, path: string, stats: Stats): Promise<string | null> {
        return path.substr(this.containerDirectory.length+1).replace(/\\/g, '/')
    }

}
