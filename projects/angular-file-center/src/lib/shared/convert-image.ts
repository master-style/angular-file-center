import { loadImageFromFile } from './load-image-from-file';

export async function convertImage(file: File, ext: string, options?: {
    size?: number,
    quality?: number,
    square?: boolean,
    image?: HTMLImageElement
}) {
    let image: HTMLImageElement;
    if (options?.image) {
        image = options.image;
    } else {
        image = (await loadImageFromFile(file)).image;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const size = options.size ? Math.min(options.size, image.width) : image.width;
    const ratio = size / image.width;

    let imageWidth = image.width;
    let imageHeight = image.height;
    let width = size;
    let height = imageHeight * ratio;
    let sx = 0;
    let sy = 0;

    if (options.square) {
        const squareSize = options.size ? options.size : Math.min(width, height);
        const minOriginSize = Math.min(imageWidth, imageHeight);
        canvas.width = canvas.height = width = height = squareSize;
        sx = (imageWidth - minOriginSize) / 2;
        sy = (imageHeight - minOriginSize) / 2;
        imageWidth = imageHeight = minOriginSize;
    } else {
        canvas.width = size;
        canvas.height = imageHeight * ratio;
    }

    ctx.drawImage(image, sx, sy, imageWidth, imageHeight, 0, 0, width, height);

    const convert = (_ext) => new Promise((resolve) => {
        canvas.toBlob((blob) => {
            resolve({
                blob,
                url: URL.createObjectURL(blob),
                width,
                height
            });
        }, 'image/' + _ext, options.quality);
    });

    const artifact: any = await convert(ext);

    if (ext === 'webp' && artifact.blob.type.indexOf(ext) === -1) {
        return await convert('jpeg');
    } else {
        return artifact;
    }
}