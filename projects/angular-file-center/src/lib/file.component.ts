import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
        public location: Location
    ) { }

    @ViewChild('modal') modalRef: ElementRef<any>;

    localStorage = localStorage;
    subscription;

    async ngOnInit() {
        this.fileService.route = this.route;
        this.subscription = this.fileService
            .onDirectoryChanged
            .subscribe(async activatedRoute => {
                this.fileService.directoryRoute = activatedRoute;

                const directoryPaths = [];
                for (let nowRoute = activatedRoute; nowRoute && nowRoute !== this.route; nowRoute = nowRoute.parent.parent) {
                    directoryPaths.unshift(decodeURIComponent(nowRoute.params['_value']['id']));
                }

                if (directoryPaths.length && activatedRoute === null)
                    return;

                await this.fileService.list(directoryPaths.join('/'));

                this.fileService.directoryPaths = directoryPaths;
            });

        if (!this.route.snapshot.firstChild) {
            this.fileService.onDirectoryChanged.next(null);
        }
    }

    ngAfterViewInit(): void {
        this.modalRef?.nativeElement.open();
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();

        this.fileService.target = undefined;
        this.fileService.accept = undefined;
        this.fileService.targetKey = undefined;
        this.fileService.multiple = undefined;
    }
}
