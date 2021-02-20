import { Pipe, PipeTransform } from '@angular/core';
import { FileService, IFile, MetadataResult } from '../file.service';

@Pipe({
    name: 'metadata'
})
export class MetadataPipe implements PipeTransform {

    constructor(
        private fileService: FileService
    ) { }

    transform(file: IFile): Promise<MetadataResult> {
        return this.fileService.handler.getMetadata(file) as Promise<MetadataResult>;
    }
}
