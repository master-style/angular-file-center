import { Location } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FileService } from './file.service';

@Component({
    selector: 'app-file',
    templateUrl: './file.component.html',
    styleUrls: ['./file.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileComponent implements OnInit, OnDestroy, AfterViewInit {

    constructor(
        public route: ActivatedRoute,
        public fileService: FileService,
        public location: Location,
        public router: Router,
        public changeDetectorRef: ChangeDetectorRef
    ) {
        this.fileService.changeDetectorRef = changeDetectorRef;
    }

    @ViewChild('modal') modalRef: ElementRef<any>;
    @ViewChild('content') contentRef: ElementRef<any>;

    localStorage = localStorage;
    subscriptions = [];

    async ngOnInit() {
        this.fileService.route = this.route;
        this.subscriptions.push(
            this.fileService
                .onDirectoryChanged
                .subscribe(async activatedRoute => {
                    this.fileService.directoryRoute = activatedRoute;

                    const directoryPaths = [];
                    for (let nowRoute = activatedRoute; nowRoute && nowRoute !== this.route; nowRoute = nowRoute.parent.parent) {
                        directoryPaths.unshift(decodeURIComponent(nowRoute.params['_value']['id']));
                    }

                    await this.fileService.list(directoryPaths.join('/'));

                    this.fileService.directoryPaths = directoryPaths;
                })
        );

        for (let nowRoute = this.route; ; nowRoute = nowRoute.firstChild.firstChild) {
            if (!nowRoute.firstChild) {
                this.fileService.onDirectoryChanged.next(nowRoute);
                break;
            }
        }
    }

    ngAfterViewInit(): void {
        this.modalRef?.nativeElement.open();
        this.fileService.contentRef = this.contentRef;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((eachSubscriptions) => eachSubscriptions.unsubscribe());
        this.fileService.clear();
    }
}
