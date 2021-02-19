import { Pipe, PipeTransform } from '@angular/core';
import { FileService, MetadataResult } from '../file.service';

@Pipe({
    name: 'metadata'
})
export class MetadataPipe implements PipeTransform {

    constructor(
        private fileService: FileService
    ) { }

    transform(fullPath: string): Promise<MetadataResult> {
        return this.fileService.handler.getMetadata(fullPath);
    }
}
