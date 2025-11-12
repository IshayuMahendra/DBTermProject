"use server";

import dbConnect from "@/app/lib/db_connection";
import { getSession } from "@/app/lib/sessionManager";
import Poll from "@/models/pollSchema";
import { publicPollFromPoll } from "@/models/publicPoll";
import { NextResponse } from "next/server";

//GET /api/profile
//Returns polls (editable) the user has created.
export async function GET() {
  try {
    await dbConnect();

    const session = await getSession();

    if(!session) {
      return NextResponse.json({ message: 'An authorization error occured.' }, { status: 401 });
    }

    const userID = session._id;
    const userPolls = await Poll.find({ 'creator.userId': userID }).sort({ createdAt: -1 });
    
    const publicPolls = [];
    for(const poll of userPolls) {
      publicPolls.push(await publicPollFromPoll(poll, session));
    }
    
    return NextResponse.json(publicPolls, { status: 200 });
  } catch (e: unknown) {
    console.log(e);
    let message = "unknown error";
    if(e instanceof Error) {
        message = e.message;
    }
    return NextResponse.json({ message: message }, { status: 500 });
  }
}
