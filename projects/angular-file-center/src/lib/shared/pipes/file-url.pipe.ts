import { Pipe, PipeTransform } from '@angular/core';
import { FileService } from '../../file.service';

@Pipe({
    name: 'fileUrl'
})
export class FileUrlPipe implements PipeTransform {
    constructor (
        private fileService: FileService
    ) {}

    transform(fullPath: string, ...args: unknown[]): Promise<string> {
        const sizeName = args[0];
        if (sizeName) {
            const lastSlashIndex = fullPath.lastIndexOf('/');
            const dirPath = fullPath.substr(0, lastSlashIndex);
            const fileName = fullPath.substr(lastSlashIndex !== -1 ? lastSlashIndex + 1 : 0, fullPath.length);
            fullPath = dirPath + '/.@' + sizeName + '/' + fileName;
        }
        return this.fileService.handler.getDownloadURL(fullPath);
    }
}
