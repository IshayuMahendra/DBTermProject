"use server";

import dbConnect from "@/app/lib/db_connection";
import { getSession } from "@/app/lib/sessionManager";
import Poll from "@/models/pollSchema";
import { publicPollFromPoll } from "@/models/publicPoll";
import { NextResponse } from "next/server";

//GET /api/poll
//List all polls ever created.
export async function GET() {
    try {
      await dbConnect();
  
      const polls = await Poll.find().sort({ createdAt: -1 });
      const session = await getSession();

      const publicPolls = [];
      for(const poll of polls) {
        publicPolls.push(await publicPollFromPoll(poll, session));
      }
      
      return NextResponse.json(publicPolls, { status: 200 });
    } catch (e) {
      console.log(e);
        let message = "unknown error";
        if(e instanceof Error) {
            message = e.message;
        }
        return NextResponse.json({ message: message }, { status: 500 });
    }
  }
  