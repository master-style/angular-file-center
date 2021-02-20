import { Pipe, PipeTransform } from '@angular/core';
import { FileService, IFile, MetadataResult } from '../file.service';

@Pipe({
    name: 'file-metadata'
})
export class FileMetadataPipe implements PipeTransform {

    constructor(
        private fileService: FileService
    ) { }

    transform(filePath: string): Promise<MetadataResult> {
        return this.fileService.handler.getMetadata(filePath);
    }
}
