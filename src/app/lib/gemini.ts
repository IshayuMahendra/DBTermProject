"use server";

interface AIPoll {
    title: string;
    options: string[];
}

interface GeminiResponse {
    candidates: {
        finishReason?: string;
        content?: {
            parts: {
                text?: string
                inlineData?: {
                    data: string;
                    mimeType: string;
                }
            }[]
        }
    }[]
}

function verifyKey() {
    if(!process.env.GEMINI_API_KEY) {
        throw new Error("Unable to find GEMINI_API_KEY in env");
    }
}

export async function generatePoll(demographic: string): Promise<AIPoll> {
    verifyKey();
    console.log("[GEMINI] Generating Poll");
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [
                {
                    "parts": [{ "text": `Generate a unique poll for ${demographic}.  Return a JSON object with the title of the poll as 'title' and  four options as a string array of 'options'.  Only return the JSON object, nothing else.` }]
                }
            ],
            generationConfig: { "response_mime_type": "application/json" }
        })
    })
    const jsonData: GeminiResponse = await r.json();

    if(!jsonData.candidates || !jsonData.candidates[0] || !jsonData.candidates[0].content || !jsonData.candidates[0].content.parts || !jsonData.candidates[0].content.parts[0] || !jsonData.candidates[0].content.parts[0].text) {
        let errorMsg = "unknown error";
        if(jsonData.candidates && jsonData.candidates[0] && jsonData.candidates[0].finishReason) {
            errorMsg = jsonData.candidates[0].finishReason;
        }
        throw new Error(errorMsg);
    }

    const generatedPoll: AIPoll = JSON.parse(jsonData.candidates[0].content.parts[0].text);
    return generatedPoll;
}