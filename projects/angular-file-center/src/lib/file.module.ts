import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileComponent } from './file.component';
import { FileRoutingModule } from './file.routing.module';
import { NgxFilesizeModule } from 'ngx-filesize';
import { FileUrlPipe } from './shared/file-url.pipe';
import { FileOptions, FileService, FILE_OPTIONS } from './file.service';
import { TranslationPipe } from './shared/translation.pipe';
import { FileMetadataPipe } from './shared/file-metadata.pipe';

@NgModule({
    declarations: [
        FileComponent,
        FileUrlPipe,
        TranslationPipe,
        FileMetadataPipe
    ],
    imports: [
        CommonModule,
        FileRoutingModule,
        NgxFilesizeModule
    ],
    exports: [
        CommonModule,
        FileUrlPipe,
        FileMetadataPipe
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
