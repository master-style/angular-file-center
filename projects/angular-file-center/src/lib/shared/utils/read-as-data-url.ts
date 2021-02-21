export function readAsDataUrl(file: File | Blob) {
    return new Promise((reslove) => {
        const reader = new FileReader();
        reader.onload = (event: ProgressEvent) => {
            reslove((event.target as FileReader).result);
        };
        reader.readAsDataURL(file);
    });
}
