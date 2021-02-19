import { NgModule, CUSTOM_ELEMENTS_SCHEMA, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileComponent } from './file.component';
import { FileRoutingModule } from './file.routing.module';
import { NgxFilesizeModule } from 'ngx-filesize';
import { ImageUrlPipe } from './shared/image-url.pipe';
import { FileOptions, FileService, FILE_OPTIONS } from './file.service';
import { TranslationPipe } from './shared/translation.pipe';
import { MetadataPipe } from './shared/metadata.pipe';

@NgModule({
    declarations: [
        FileComponent,
        ImageUrlPipe,
        TranslationPipe,
        MetadataPipe
    ],
    imports: [
        CommonModule,
        FileRoutingModule,
        NgxFilesizeModule
    ],
    exports: [
        CommonModule,
        ImageUrlPipe
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
