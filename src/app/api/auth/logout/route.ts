import { destroySession } from "@/app/lib/sessionManager";
import { NextResponse } from "next/server";

//POST request to /api/auth/logout
export async function POST() {
    try {
        await destroySession();
        return NextResponse.json({message: "success"}, {status: 200});
    } catch (e: unknown) {
        console.log(e);
        let message = "unknown error";
        if(e instanceof Error) {
            message = e.message;
        }
        return NextResponse.json({ message: message }, { status: 500 });
    }
}