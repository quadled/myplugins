export function maskText(text: string) {
    return { textToTranslate: text, placeholders: [] };
}

export function unmaskText(text: string, placeholders: any[]) {
    return text;
}