import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileService } from '../file.service';

@Component({
    selector: 'app-directory',
    templateUrl: './directory.component.html',
    styleUrls: ['./directory.component.scss']
})
export class DirectoryComponent implements OnInit {

    constructor(
        private route: ActivatedRoute,
        private fileService: FileService
    ) {}

    ngOnInit(): void {
        console.log('DIRECTORY');
        this.fileService.onDirectoryChanged.next(this.route);
    }
}
