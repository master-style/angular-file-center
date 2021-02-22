import { Location } from '@angular/common';
import { ElementRef, Inject, Injectable, InjectionToken } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Subject } from 'rxjs';
import cloneDeep from 'lodash-es/cloneDeep';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import merge from 'lodash-es/merge';

import { convertImage } from './shared/utils/convert-image';
import { isImageFileName } from './shared/utils/is-image-file-name';
import { loadImageFromFile } from './shared/utils/load-image-from-file';

import { dialog } from '@master/ui';
import { isAcceptedFile } from './shared/utils/is-accepted-file';

export interface IFolder {
    name: string,
    source: any
}

export interface IFile {
    name: string,
    path: string,
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
    createdAt: Date;
}

const DEFAULT_OPTIONS = {
    imageSizes: {
        origin: { value: 800 },
        md: { value: 600 },
        sm: { value: 300 },
        icon: { value: 32, square: true }
    },
    allowWriteFolder: true,
    allowWriteFolderInRoot: true,
    accept: '',
    multiple: false
}

export interface Handler {
    list: (directoryPath?: string) => Promise<ListResult>,
    createFolder: (currentPath: string, name: string) => Promise<void>,
    deleteFolder: (folder: IFolder) => Promise<void>,
    deleteFile: (filePath: string) => Promise<void>,
    upload: (task: Task) => Promise<void>,
    onUpload?: () => Promise<void>,
    onUploaded?: () => Promise<void>,
    getDownloadURL: (filePath: string) => Promise<string>,
    getMetadata: (file: IFile) => Promise<MetadataResult>
}

export interface FileOptions {
    translations?: Record<string, string>,
    imageSizes?: Record<string, Record<string, any>>,
    directoryTranslations?: Record<string, Record<string, string>>,
    allowWriteFolder?: boolean,
    allowWriteFolderInRoot?: boolean,
    accept?: string,
    multiple?: boolean
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
        private router: Router,
        @Inject(FILE_OPTIONS) public options: FileOptions,
        private sanitizer: DomSanitizer
    ) {
        this.options = merge(DEFAULT_OPTIONS, options);
    }

    handler: Handler;
    route: ActivatedRoute;
    tasks = [];
    target: any;
    targetKey: string;
    selectingColor = 'blue';
    onDirectoryChanged = new Subject<ActivatedRoute>();
    mode = '';
    page = 0;
    files = [];
    querying = true;
    uploading = '';
    deleting = false;
    contentRef: ElementRef<any>;

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
        return isAcceptedFile(metadata, this.options.accept);
    }

    select(target: any, targetKey: string, options: FileOptions) {
        this.target = target;
        this.targetKey = targetKey;
        this.mode = 'select';
        this.options = merge(this.options, options);
    }

    async list(directoryPath?) {
        this.querying = true;
        const list = await this.handler.list(directoryPath);
        this.contentRef?.nativeElement.reset();
        this.directories = list.folders;
        this.files = list.files;
        this.querying = false;
    }

    clear() {
        this.target = undefined;
        this.targetKey = undefined;
        this.mode = '';
        this.files = [];
        this.directories = [];
        this.directoryPaths = [];
        this.selectedFiles = [];
        this.selectedFilePaths.clear();
    }

    selectFile(file) {
        const filePath = file.path;
        // 若為單選，清空前一次所選
        if (!this.options.multiple && this.selectedFilePaths.size && this.mode === 'select') {
            this.selectedFilePaths.clear();
            this.selectedFiles = [];
        }
        if (
            this.selectedFilePaths.has(filePath)
        ) {
            this.selectedFilePaths.delete(filePath);
            this.selectedFiles = this.selectedFiles.filter((eachFile) => eachFile.path === filePath);
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
                                    let path = eachFile.path;
                                    if (eachSizeName !== 'origin') {
                                        const dirPath = eachFile.path.replace(eachFile.name, '');
                                        path = dirPath + '.@' + eachSizeName + '/' + eachFile.name;
                                    }
                                    promises.push(this.handler.deleteFile(path));
                                }
                            } else {
                                promises.push(this.handler.deleteFile(eachFile.path));
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
                        await this.list(this.currentPath);
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

    async deleteFolder(directory) {
        try {
            dialog({
                title: this.getTranslation('Confirm deletion ?'),
                text: this.getTranslation('The files in the {0} folder will be deleted and cannot be recovered').replace('{0}', directory.name),
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

        await this.handler.onUpload?.();

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
                                    const eachTask = cloneDeep(task);
                                    const eachSize = imageSizes[eachSizeName];
                                    eachTask.artifact = await convertImage(file, 'webp', {
                                        size: eachSize.value,
                                        quality: eachSize.quality || .5,
                                        image: artifact.image,
                                        square: eachSize.square
                                    });
                                    eachTask.artifact.url = this.sanitizer.bypassSecurityTrustUrl(artifact.url);
                                    const fileExt = eachTask.artifact.blob.type.substring(eachTask.artifact.blob.type.lastIndexOf('/') + 1); // webp
                                    eachTask.path = this.currentPath
                                        + (path ? '/' + path : '')
                                        + '/'
                                        + (eachSizeName === 'origin'
                                            ? ''
                                            : ('.@' + eachSizeName + '/'))
                                        + name + '.' + fileExt;
                                    await this.addStorageTask(eachTask);
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

        await this.handler.onUploaded?.();

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

    async next(directory) {
        await this.router.navigate(['./', directory.name], { relativeTo: this.directoryRoute ?? this.route });

        this.onDirectoryChanged.next(this.directoryRoute.firstChild.firstChild);
    }

    async go(directoryPath?) {
        const index = this.directoryPaths.indexOf(directoryPath);
        const paths = index === -1
            ? []
            : this.directoryPaths.slice(0, index + 1);

        this.router.navigate(
            paths.length
                ? ['./', ...paths]
                : ['./'],
            { relativeTo: this.route });

        let route = this.route;
        for (let i = 0; i < paths.length; i++) {
            route = route.firstChild.firstChild;
        }

        this.onDirectoryChanged.next(route);
    }

    async apply() {
        if (this.options.multiple) {
            if (!this.target[this.targetKey]) {
                this.target[this.targetKey] = [];
            }
            this.target[this.targetKey].push(...Array.from(this.selectedFilePaths));
        } else {
            this.target[this.targetKey] = this.selectedFilePaths.values().next().value;
        }
        this.mode = '';
        this.back();
    }

    back() {
        this.router.navigate(['../'], { relativeTo: this.route })
    }

    async canDeactivate(
        component
    ): Promise<boolean> {
        const modal = component.modalRef.nativeElement;
        modal.close();
        await modal.changing;
        return true;
    }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (this.target) {
            return true;
        } else {
            let redirectTo = route.pathFromRoot
                .filter(p => p !== route && p.url !== null && p.url.length > 0)
                .reduce((arr, p) => arr.concat(p.url.map(u => u.path)), []);

            this.router.navigate(redirectTo, { relativeTo: this.route });

            return false;
        }
    }
}
