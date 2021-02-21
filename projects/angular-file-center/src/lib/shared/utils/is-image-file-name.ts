
export function isImageFileName(filename: string) {
    return filename.match(/.(jpg|jpeg|png|gif|webp|svg)$/i);
}