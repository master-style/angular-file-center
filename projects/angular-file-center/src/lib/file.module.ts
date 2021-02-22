import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileComponent } from './file.component';
import { NgxFilesizeModule } from 'ngx-filesize';
import { FileUrlPipe } from './shared/pipes/file-url.pipe';
import { FileOptions, FileService, FILE_OPTIONS } from './file.service';
import { TranslationPipe } from './shared/pipes/translation.pipe';
import { FileMetadataPipe } from './shared/pipes/file-metadata.pipe';

@NgModule({
    declarations: [
        FileComponent,
        FileUrlPipe,
        TranslationPipe,
        FileMetadataPipe
    ],
    imports: [
        CommonModule,
        NgxFilesizeModule
    ],
    exports: [
        CommonModule,
        FileUrlPipe,
        FileMetadataPipe,
        FileComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class FileModule {
    static forRoot(options?: FileOptions): ModuleWithProviders<FileModule> {
        return {
            ngModule: FileModule,
            providers: [
                { provide: FILE_OPTIONS, useValue: options },
                FileService
            ]
        };
    }
    static forChild(options?: FileOptions): ModuleWithProviders<FileModule> {
        return {
            ngModule: FileModule,
            providers: [
                { provide: FILE_OPTIONS, useValue: options },
                FileService
            ]
        };
    }
}
