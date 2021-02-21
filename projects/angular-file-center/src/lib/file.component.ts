import { Location } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
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
        public location: Location,
        public router: Router
    ) { }

    @ViewChild('modal') modalRef: ElementRef<any>;

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

                    if (directoryPaths.length && activatedRoute === null)
                        return;

                    await this.fileService.list(directoryPaths.join('/'));

                    this.fileService.directoryPaths = directoryPaths;
                }),
            this.router.events.subscribe((event) => {
                if (event instanceof NavigationEnd) {
                    if (!this.route.snapshot.firstChild) {
                        this.fileService.onDirectoryChanged.next(null);
                    }
                }
            })
        );

    }

    ngAfterViewInit(): void {
        this.modalRef?.nativeElement.open();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((eachSubscriptions) => eachSubscriptions.unsubscribe());

        this.fileService.target = undefined;
        this.fileService.options.accept = undefined;
        this.fileService.targetKey = undefined;
        this.fileService.options.multiple = undefined;
    }
}
