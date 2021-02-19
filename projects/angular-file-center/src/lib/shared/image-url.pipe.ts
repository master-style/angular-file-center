import { Pipe, PipeTransform } from '@angular/core';
import { FileService } from '../file.service';

@Pipe({
    name: 'imageUrl'
})
export class ImageUrlPipe implements PipeTransform {
    constructor (
        private fileService: FileService
    ) {}

    transform(fullPath: string, ...args: unknown[]): Promise<string> {
        const sizeName = args[0];
        const lastSlashIndex = fullPath.lastIndexOf('/');
        const dirPath = fullPath.substr(0, lastSlashIndex);
        const fileName = fullPath.substr(lastSlashIndex !== -1 ? lastSlashIndex + 1 : 0, fullPath.length);
        if (sizeName) {
            fullPath = dirPath + '/.@' + sizeName + '/' + fileName;
        }
        return this.fileService.handler.getDownloadURL(fullPath);
    }
}
