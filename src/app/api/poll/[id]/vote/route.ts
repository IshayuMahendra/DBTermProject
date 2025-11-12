import dbConnect from "@/app/lib/db_connection";
import { getSession } from "@/app/lib/sessionManager";
import Poll, { IPoll } from "@/models/pollSchema";
import User, { IUser } from "@/models/userSchema";
import Vote, { IVote } from "@/models/voteSchema";
import { isValidObjectId } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

//POST /api/poll/:id/vote
//Vote on a poll with id :id
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const pollId = params.id;
    const canVoteAnonymously = (process.env.NEXT_PUBLIC_CAN_VOTE_ANONYMOUSLY == "true");
    let user: IUser | null | undefined;

    if (!isValidObjectId(pollId)) {
      return NextResponse.json(
        { message: "Invalid poll ID" },
        { status: 400 }
      );
    }

    await dbConnect();

      const session = await getSession();
      if ((!session || !session._id) && !canVoteAnonymously) {
        //Note: User's authentication will already be checked with middleware, so session should never be null.
        //hence, if session or session id is null, we have an odd error.
        return NextResponse.json(
          { message: "User is not logged in" },
          { status: 403 }
        );
      }

      //If the user session is passed
      if(session) {
        user = await User.findById(
          session._id
        );

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }
    }

    const poll: IPoll | null = await Poll.findById(pollId);
    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    if (user) {
      //Check to ensure the user has not already voted
      const potentialVote: IVote | null = await Vote.findOne({ pollId: poll._id, userId: user._id });
      if (potentialVote) {
        return NextResponse.json({ message: "You've already voted on this poll." }, { status: 403 });
      }
    }

    const jsonData = await request.json();
    if (!Object.keys(jsonData).includes("optionIndex")) {
      return NextResponse.json(
        { message: "A valid option index was not provided" },
        { status: 400 }
      );
    }

    const optionIndex: number = parseInt(jsonData["optionIndex"]);

    if (!poll.options[optionIndex]) {
      return NextResponse.json({ message: `Option at index ${optionIndex} does not exist on poll ${pollId}` }, { status: 404 });
    }

    //Cast the vote
    poll.options[optionIndex].votes++;
    if (user) {
      const vote: IVote = new Vote({
        userId: user._id,
        pollId: poll._id
      });
      await vote.save();
    }

    await poll.save();

    return NextResponse.json(
      {
        message: "Vote submitted",
        results: poll.options
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Error editing poll:", e);
    return NextResponse.json({ message: e instanceof Error ? e.message : "An unknown error occurred" }, { status: 500 });
  }
}