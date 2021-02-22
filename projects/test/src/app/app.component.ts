import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import firebase from 'firebase/app';
import 'firebase/storage';
import { FileService } from 'projects/angular-file-center/src/lib/file.service';
import { getHandlerFromFirebaseStorage } from 'projects/angular-file-center/src/lib/shared/utils/get-handler-from-firebase-storage';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    
    constructor(
        fileService: FileService
    ) {
        const firebaseApp = firebase.initializeApp(environment.firebaseConfig);
        fileService.handler = getHandlerFromFirebaseStorage(firebaseApp.storage());
    }
}
