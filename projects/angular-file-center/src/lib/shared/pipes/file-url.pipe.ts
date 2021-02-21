import { Pipe, PipeTransform } from '@angular/core';
import { FileService } from '../../file.service';

@Pipe({
    name: 'fileUrl'
})
export class FileUrlPipe implements PipeTransform {
    constructor(
        private fileService: FileService
    ) { }

    async transform(fullPath: string, ...args: unknown[]): Promise<string> {
        if (!fullPath) {
            return '';
        }
        const sizeName = args[0];
        if (sizeName) {
            const lastSlashIndex = fullPath.lastIndexOf('/');
            const dirPath = fullPath.substr(0, lastSlashIndex);
            const fileName = fullPath.substr(lastSlashIndex !== -1 ? lastSlashIndex + 1 : 0, fullPath.length);
            fullPath = dirPath + '/.@' + sizeName + '/' + fileName;
        }
        return await this.fileService.handler.getDownloadURL(fullPath);
    }
}
