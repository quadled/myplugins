export async function translateWithFallback(
    text: string,
    sourceLang?: string,
    targetLang: string = "en",
    includeSource: boolean = true,
    translator?: string
): Promise<{ text: string; source_lang: string }> {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang || "auto"}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
        const res = await fetch(url)
        const data = await res.json()
        
        const translatedText = data[0]?.map((item: any) => item[0]).join("") || text
        const detectedLang = data[2] || sourceLang || "en"
        
        return { text: translatedText, source_lang: detectedLang }
    } catch (e) {
        return { text, source_lang: sourceLang || "en" }
    }
}