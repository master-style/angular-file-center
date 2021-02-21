import { Pipe, PipeTransform } from '@angular/core';
import { FileService } from '../../file.service';

@Pipe({
    name: 'translation'
})
export class TranslationPipe implements PipeTransform {
    constructor (
        private fileService: FileService
    ) {}

    transform(name: string): string {
        return this.fileService.getTranslation(name);
    }
}
