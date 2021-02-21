import { Handler, IFile, IFolder } from '../file.service';

export function getHandlerFromFirebaseStorage(storage) {
    return {
        list: async (directoryPath: string) => {
            const list = await storage.ref(directoryPath).listAll();
            return {
                folders: list.prefixes.map(eachPrefix => ({
                    name: eachPrefix.name,
                    source: eachPrefix
                })),
                files: list.items.map(eachItem => ({
                    name: eachItem.name,
                    path: eachItem.fullPath,
                    source: eachItem
                }))
            }
        },
        createFolder: async (currentPath: string, name: string) => {
            await storage
                .ref(currentPath + name)
                .child('.')
                .putString('');
        },
        deleteFolder: async (folder: IFolder) => {
            const items = [];
            await (async function deleteDeep(eachFolder) {
                const list = await eachFolder.source.listAll();
                for (const item of list.items) {
                    items.push(item);
                }
                for (const prefix of list.prefixes) {
                    await deleteDeep(prefix);
                }
            })(folder);
            await Promise.all(items.map(async (eachItem) => await eachItem.delete()));
        },
        deleteFile: async (filePath: string) => {
            return storage.ref(filePath).delete();
        },
        upload: (task: any) => {
            return new Promise(resolve => {
                const storageTask = storage.ref(task.path).put(task.artifact.blob);

                storageTask.on('state_changed', (snapshot) => {
                    // Observe state change events such as progress, pause, and resume
                    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                    task.progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + task.progress + '% done');
                    switch (snapshot.state) {
                        case 'paused':
                            console.log('Upload is paused');
                            break;
                        case 'running':
                            console.log('Upload is running');
                            break;
                    }
                }, error => {
                    console.log(error)
                }, resolve);
            });
        },
        getDownloadURL: (filePath: string) => {
            return storage.ref(filePath).getDownloadURL();
        },
        getMetadata: async (filePath: string) => {
            const metadata = await storage.ref(filePath).getMetadata();
            return {
                name: metadata.name,
                contentType: metadata.contentType,
                size: metadata.size,
                timeCreated: metadata.timeCreated
            }
        }
    } as Handler;
}
