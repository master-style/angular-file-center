import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FileService } from './file.service';

@Component({
    selector: 'app-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss']
})
export class FileComponent implements OnInit, OnDestroy, AfterViewInit {

    constructor(
        public route: ActivatedRoute,
        private router: Router,
        public fileService: FileService,
        public translateService: TranslateService,
        public location: Location
    ) { }

    @ViewChild('modal') modalRef: ElementRef<any>;

    localStorage = localStorage;

    ngOnInit() {
        this.fileService
            .onDirectoryChanged
            .subscribe(async activatedRoute => {
                this.fileService.directoryRoute = activatedRoute;
                const ids = this.router.url.split('?')[0].split('/');
                const storageIndex = ids.findIndex(eachId => eachId === 'file');
                if (storageIndex !== -1) {
                    this.fileService.directoryPaths = ids.slice(storageIndex + 1);
                } else {
                    this.fileService.directoryPaths = ids.slice(3);
                }

                if (this.fileService.directoryPaths.length && activatedRoute === null)
                    return;

                this.fileService.directoryPaths = this.fileService.directoryPaths.map((eachDirectoryPath) => decodeURIComponent(eachDirectoryPath));

                await this.fileService.list(this.fileService.directoryPaths.join('/'));
            });
    }

    ngAfterViewInit(): void {
        this.modalRef?.nativeElement.open();
    }

    ngOnDestroy(): void {
        this.fileService.onDirectoryChanged.next(null);
    }

    async apply() {
        if (this.fileService.multiple) {
            if (!this.fileService.target[this.fileService.targetKey]) {
                this.fileService.target[this.fileService.targetKey] = [];
            }
            this.fileService.target[this.fileService.targetKey].push(...Array.from(this.fileService.selectedFilePaths));
        } else {
            this.fileService.target[this.fileService.targetKey] = this.fileService.selectedFilePaths.values().next().value;
        }

        this.fileService.back(this.route);
    }
}
