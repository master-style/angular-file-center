import { Location } from '@angular/common';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import cloneDeep from 'lodash-es/cloneDeep';
import { SafeUrl } from '@angular/platform-browser';
import merge from 'lodash-es/merge';

import { convertImage } from './shared/convert-image';
import { isImageFileName } from './shared/is-image-file-name';
import { loadImageFromFile } from './shared/load-image-from-file';

import { isAcceptedFile } from './shared/is-accepted-file';
import { dialog } from '@master/ui';

export interface IFolder {
    name: string,
    source: any
}

export interface IFile {
    name: string,
    fullPath: string,
    source: any
}

export interface ListResult {
    folders: IFolder[],
    files: IFile[]
}

export interface MetadataResult {
    name: string;
    contentType: string;
    size: number;
    timeCreated: Date;
}

const DEFAULT_OPTIONS = {
    imageSizes:  {
        origin: { value: 800 },
        md: { value: 600 },
        sm: { value: 300 },
        icon: { value: 32, square: true }
    }
}

export interface Handler {
    list: (directoryPath?: string) => Promise<ListResult> | ListResult,
    createFolder: (currentPath: string, name: string) => Promise<void> | void,
    deleteFolder: (folder: IFolder) => Promise<void> | void,
    deleteFile: (filePath: string) => Promise<void>,
    upload: (task: Task) => Promise<void> | void,
    getDownloadURL: (filePath: string) => Promise<string>,
    getMetadata: (file: IFile) => Promise<MetadataResult>
}

export interface FileOptions {
    translations?: Record<string, string>,
    imageSizes?: Record<string, Record<string, any>>,
    directoryTranslations?: Record<string, Record<string, string>>
}

export const FILE_OPTIONS = new InjectionToken<FileOptions>('FileOptions');

interface Task {
    artifact?: {
        blob?: Blob;
        url?: SafeUrl;
        name: string
    };
    date: Date;
    path?: string;
    file: File;
    type: string;
    progress: number;
};

@Injectable()
export class FileService {

    constructor(
        private location: Location,
        private router: Router,
        @Inject(FILE_OPTIONS) public options: FileOptions
    ) { 
        this.options = merge(DEFAULT_OPTIONS, options);
    }

    handler: Handler;

    tasks = [];
    target: any;
    targetKey: string;
    accept = '';
    multiple = false;
    selectingColor = 'blue';
    onDirectoryChanged = new Subject<ActivatedRoute>();

    page = 0;
    files = [];
    querying = true;
    uploading = '';
    deleting = false;

    selectedFilePaths = new Set();
    selectedFiles = [];
    directoryPaths = [];
    directories = [];
    directoryRoute: ActivatedRoute;

    get imageSizes() {
        return this.options.imageSizes;
    }

    get currentPath() {
        return this.directoryPaths.join('/');
    }

    get currentDirectory() {
        return this.directoryPaths[this.directoryPaths.length - 1];
    }

    getBreadcrumbTranslation(directoryPath: string) {
        const index = this.directoryPaths.indexOf(directoryPath);

        const parentPath = this.directoryPaths
            .filter((_, i) => i < index)
            .join('/');

        return this.options?.directoryTranslations?.[parentPath]?.[directoryPath] ?? directoryPath;
    }

    getFolderTranslation(folderName: string) {
        return this.options?.directoryTranslations?.[this.directoryPaths.join('/')]?.[folderName] ?? folderName;
    }

    getTranslation(name: string) {
        return this.options?.translations?.[name] ?? name;
    }

    isAcceptedFile(metadata: { name: string, contentType: string }): boolean {
        return isAcceptedFile(metadata, this.accept);
    }

    select(target: any, targetKey: string, accept: string, multiple: boolean, directoryPath: string) {
        this.target = target;
        this.accept = accept;
        this.targetKey = targetKey;
        this.multiple = multiple;
        this.router.navigateByUrl(this.router.url + '/storage' + (directoryPath ? '/' + directoryPath : ''));
    }

    reset() {
        this.accept = 'image/*,video/*';
        this.multiple = true;
    }

    canActivate(): boolean {
        // if (!this.target) {
        //     this.location.back();
        //     this.reset();
        //     return false;
        // } 

        return true;
    }

    async list(directoryPath?) {
        this.querying = true;

        const list = await this.handler.list(directoryPath);

        this.directories = list.folders;
        this.files = list.files;

        this.page = 0;

        this.querying = false;
    }

    selectFile(file) {
        const filePath = file.fullPath;
        if (!this.multiple && this.selectedFilePaths.size) {
            this.selectedFilePaths.clear();
            this.selectedFiles = [];
        }
        if (
            this.selectedFilePaths.has(filePath)
        ) {
            this.selectedFilePaths.delete(filePath);
            this.selectedFiles = this.selectedFiles.filter((eachFile) => eachFile.fullPath === filePath);
        } else {
            this.selectedFilePaths.add(filePath);
            this.selectedFiles.push(file);
        }
    }

    async deleteFiles() {
        try {
            dialog({
                title: '確定刪除？',
                text: '選取的' + ' ' + this.selectedFilePaths.size + ' ' + '個項目刪除後便無法復原',
                type: 'error',
                onAccept: async () => {
                    try {
                        this.deleting = true;
                        const promises: Promise<void>[] = [];

                        for (const eachFile of this.selectedFiles as any[]) {
                            if (isImageFileName(eachFile.name)) {
                                const imageSizes = this.imageSizes;
                                // tslint:disable-next-line: forin
                                for (const eachSizeName in imageSizes) {
                                    let fullPath = eachFile.fullPath;
                                    if (eachSizeName !== 'origin') {
                                        const dirPath = eachFile.fullPath.replace(eachFile.name, '');
                                        fullPath = dirPath + '.@' + eachSizeName + '/' + eachFile.name;
                                    }
                                    promises.push(this.handler.deleteFile(fullPath));
                                }
                            } else {
                                promises.push(this.handler.deleteFile(eachFile.fullPath));
                            }
                        }

                        await Promise.all(promises);
                    } catch (error) {
                        console.log(error);
                    }
                    
                    this.selectedFiles = [];
                    this.selectedFilePaths.clear();
                    await this.list(this.directoryPaths.join('/'));
                    this.deleting = false;
                    return true;
                },
                acceptButton: {
                    type: 'submit',
                    style: '--button-f-color: var(--f-red)',
                    $text: this.getTranslation('delete'),
                },
                cancelButton: {
                    $if: true,
                    $text: this.getTranslation('cancel')
                },
            });
        } catch {
            this.deleting = false;
        }
    }

    // storage 無建立資料夾 api，只能透過 add 與 delete 來間接創建
    createFolder() {
        dialog({
            title: this.getTranslation('Create Folder'),
            // type: 'success',
            onAccept: (data) => {
                if (data.valid) {
                    return new Promise(async (resolve) => {
                        await this.handler.createFolder(this.currentPath ? this.currentPath + '/' : '', data.value['folder-name'])
                        await this.list(this.currentDirectory);
                        resolve(true);
                    });
                } else {
                    return false;
                }
            },
            onCancel(data) {
                return true;
            },
            acceptButton: {
                type: 'submit',
                $text: this.getTranslation('create'),
            },
            cancelButton: {
                $if: true,
                $text: this.getTranslation('cancel')
            },
            controls: [
                'm-input', {
                    class: 'outlined x:12',
                    autofocus: true,
                    name: 'folder-name',
                    type: 'text',
                    pattern: '^[^.].*$',
                    placeholder: this.getTranslation('Please enter the folder name'),
                    label: this.getTranslation('name'),
                    'when-pattern-mismatch': this.getTranslation('Not allow name starting with . dot'),
                    'when-value-missing': this.getTranslation('required'),
                    required: true,
                    $created: (input) => {
                        input.on('input', () => {
                            console.log(input.validity);
                        })
                    }
                }
            ]
        });
    }

    async deletePrefix(directory) {
        try {
            dialog({
                title: '確定刪除？',
                text: directory.name + ' ' + '資料夾內的檔案將一併被刪除，且無法復原',
                type: 'error',
                onAccept: async () => {
                    try {
                        directory.busy = true;

                        await this.handler.deleteFolder(directory);

                        await this.list(this.directoryPaths.join('/'));
                    } catch (error) {
                        console.log(error);
                    }
                    
                    return true;
                },
                acceptButton: {
                    type: 'submit',
                    style: '--button-f-color: var(--f-red)',
                    $text: this.getTranslation('delete'),
                },
                cancelButton: {
                    $if: true,
                    $text: this.getTranslation('cancel')
                },
            });
        } catch {
            directory.busy = false;
        }
    }

    async upload(event) {
        const files = event.target.files;

        const popup: any = document.getElementById('storage-task-popup');
        const popupTrigger = document.querySelector('[toggle-popup="#storage-task-popup"]');

        popup.trigger = popupTrigger;

        requestAnimationFrame(async () => {
            const closeOn = popup.closeOn;
            popup.closeOn = 'click:outside';
            await popup.open();
            popup.closeOn = closeOn;
        });

        await Promise.all(
            Array.from(files)
                .map(async (file: File) => {
                    const task: Task = {
                        type: file.type.split('/')[0],
                        date: new Date(),
                        file,
                        progress: 0,
                        artifact: {
                            name: file.name,
                        }
                    };
                    const fileName = file['webkitRelativePath'] || file['mozFullPath'] || file.name;
                    const name = fileName.substring(fileName.lastIndexOf('/') + 1, fileName.lastIndexOf('.'));
                    const path = fileName.substring(0, fileName.lastIndexOf('/'));
                    switch (task.type) {
                        case 'image':
                            const artifact = await loadImageFromFile(file);
                            const imageSizes = this.imageSizes;
                            await Promise.all(Object.keys(imageSizes)
                                .map(async (eachSizeName) => {
                                    const eachSize = imageSizes[eachSizeName];
                                    task.artifact.url = artifact.url;
                                    task.artifact = await convertImage(file, 'webp', {
                                        size: eachSize.value,
                                        quality: eachSize.quality || .5,
                                        image: artifact.image,
                                        square: eachSize.square
                                    });
                                    const fileExt = task.artifact.blob.type.substring(task.artifact.blob.type.lastIndexOf('/') + 1); // webp
                                    task.path = this.currentPath
                                        + (path ? '/' + path : '')
                                        + '/'
                                        + (eachSizeName === 'origin'
                                            ? ''
                                            : ('.@' + eachSizeName + '/'))
                                        + name + '.' + fileExt;
                                    await this.addStorageTask(cloneDeep(task));
                                })
                            );
                            break;
                        case 'video':
                            task.artifact.blob = file;
                            task.path = this.currentPath + '/' + fileName;
                            await this.addStorageTask(task);
                            break;
                    }
                })
        );

        await this.list(this.directoryPaths.join('/'));
    }

    private async addStorageTask(task: Task) {
        this.tasks
            .push(task);

        this.tasks
            .sort((a, b) => b.artifact?.width - a.artifact?.width)
            .sort((a, b) => b.date.getTime() - a.date.getTime());

       await this.handler.upload(task);
    }

    back(defaultRoute) {
        this.router.navigate(['../'], { relativeTo: defaultRoute.parent });
    }

    async next(directory, defaultRoute) {
        this.router.navigate(['./', directory.name], { relativeTo: this.directoryRoute ?? defaultRoute });
    }

    async go(defaultRoute, directoryPath?) {
        const index = this.directoryPaths.indexOf(directoryPath);
        const temp = index === -1
            ? []
            : this.directoryPaths.slice(0, index + 1);

        this.router.navigate(
            temp.length
                ? ['./', ...temp]
                : ['./'],
            { relativeTo: defaultRoute }
        );
    }
}
