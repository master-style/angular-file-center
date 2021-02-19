export function isAcceptedFile(metadata: { name: string, contentType: string }, accept: string): boolean {
    if (!accept) {
        return true;
    }
    const fileExt = metadata.name.substring(metadata.name.lastIndexOf('.'));
    const acceptSpecifiers = accept.split(',');
    let accepted = false;
    for (const acceptSpecifier of acceptSpecifiers) {
        const isExtAcceptSpecifier = acceptSpecifier[0] === '.';
        if (
            isExtAcceptSpecifier && acceptSpecifier === fileExt ||
            !isExtAcceptSpecifier && metadata.contentType.split('/')[0] === acceptSpecifier.split('/')[0]
        ) {
            accepted = true;
        }
    }
    return accepted;
}