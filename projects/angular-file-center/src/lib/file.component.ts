import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
        public fileService: FileService,
        public translateService: TranslateService,
        public location: Location
    ) { }

    @ViewChild('modal') modalRef: ElementRef<any>;

    localStorage = localStorage;
    subscription;

    ngOnInit() {
        this.subscription = this.fileService
            .onDirectoryChanged
            .subscribe(async activatedRoute => {
                this.fileService.directoryRoute = activatedRoute;

                const temp = [];
                for (let nowRoute = activatedRoute; nowRoute && nowRoute !== this.route; nowRoute = nowRoute.parent.parent) {
                    temp.unshift(decodeURIComponent(nowRoute.params['_value']['id']));
                }

                if (temp.length && activatedRoute === null)
                    return;

                this.fileService.directoryPaths = temp;

                await this.fileService.list(this.fileService.directoryPaths.join('/'));
            });
    }

    ngAfterViewInit(): void {
        this.modalRef?.nativeElement.open();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
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
