export async function loadImageFromFile(file: File) {
    const image = new Image();
    let url;
    await new Promise((resolve) => {
        image.addEventListener('load', () => {
            resolve(image);
        });
        url = image.src = URL.createObjectURL(file);
    });
    return {
        image,
        url: this.sanitizer.bypassSecurityTrustUrl(url)
    };
}
