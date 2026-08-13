export function getLanguageName(langCode: string, translator?: string): string {
    const languages: Record<string, string> = {
        en: "English",
        de: "German",
        es: "Spanish",
        fr: "French",
        ru: "Russian",
        ja: "Japanese",
        zh: "Chinese"
    };

    return languages[langCode?.toLowerCase()] || langCode?.toUpperCase() || "Unknown";
}