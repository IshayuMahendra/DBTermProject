import { generatePoll } from "@/app/lib/gemini";
import { NextResponse } from "next/server";
// const targetDemographics = [
//     "university students of the University of Georgia in Athens, GA",
//     "american college students",
//     "students",
//     "Athens, GA, USA residents"
// ]

const targetDemographics = ["tired students in an 8AM web programming class at the university of georgia"]

//GET /api/api/suggest_poll
export async function GET() {
    try {
        const randomIndex = Math.floor(Math.random() * targetDemographics.length);
        const randomDemographic = targetDemographics[randomIndex];
        const generatedPoll = await generatePoll(randomDemographic);
        return NextResponse.json(generatedPoll, { status: 200 });
    } catch (e) {
        console.log(e);
        let message = "unknown error";
        if(e instanceof Error) {
            message = e.message;
        }
        return NextResponse.json({ message: message }, { status: 500 });
    }
}