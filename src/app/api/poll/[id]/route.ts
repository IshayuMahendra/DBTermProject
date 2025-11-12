"use server";

import { BackblazeFile, bb_deleteFile } from "@/app/lib/backblaze";
import dbConnect from "@/app/lib/db_connection";
import { processAndUploadImage } from "@/app/lib/imageManager";
import { getSession } from "@/app/lib/sessionManager";
import Poll, { IPoll } from "@/models/pollSchema";
import { pollHasVotes, publicPollFromPoll } from "@/models/publicPoll";
import User, { IUser } from "@/models/userSchema";
import Vote from "@/models/voteSchema";
import { isValidObjectId, Model, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

//Get Poll
export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const pollId = params.id;

    const session = await getSession();
    if (!session || !session._id) {
      //Note: User's authentication will already be checked with middleware, so session should never be null.
      //hence, if session or session id is null, we have an odd error.
      return NextResponse.json(
        { message: "An error occured while obtaining the session" },
        { status: 500 }
      );
    }
    //Check if the pollId is a valid ObjectId
    if (!isValidObjectId(pollId)) {
      return NextResponse.json(
        { message: "Invalid poll ID" },
        { status: 400 }
      );
    }

    await dbConnect();

    const poll: IPoll | null = await Poll.findById(pollId);
    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        poll: await publicPollFromPoll(poll, session),
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Error getting poll:", e);
    return NextResponse.json({ message: e instanceof Error ? e.message : "An unknown error occurred" }, { status: 500 });
  }
}

//Edit Poll
//PUT /api/poll/:id
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const pollId = params.id;

    const session = await getSession();
    if (!session || !session._id) {
      //Note: User's authentication will already be checked with middleware, so session should never be null.
      //hence, if session or session id is null, we have an odd error.
      return NextResponse.json(
        { message: "An error occured while obtaining the session" },
        { status: 500 }
      );
    }
    //Check if the pollId is a valid ObjectId
    if (!isValidObjectId(pollId)) {
      return NextResponse.json(
        { message: "Invalid poll ID" },
        { status: 400 }
      );
    }

    const formData: FormData = (await request.formData());

    const title: string = formData.get('question') as string;
    const options: string[] = formData.getAll('option') as string[];

    //Check if the title and options are valid
    if (!title || !options || options.length < 2) {
      return NextResponse.json(
        { message: "Title and at least two options are required" },
        { status: 400 }
      );
    }

    let uploadedImage: BackblazeFile | null = null;
    if (formData.has('image')) {
      const image = formData.get('image');
      //If file is not an image
      if (!image) {
        return NextResponse.json(
          { message: "An error occured while fetching the uploaded image" },
          { status: 500 }
        );
      }
      uploadedImage = await processAndUploadImage(image);
    }

    await dbConnect();

    //Check if the user is logged in
    const user: (Model<IUser> & IUser & Document) | null = await User.findById(
      session._id
    );
    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const poll: IPoll | null = await Poll.findById(pollId);
    if (!poll) {
      return NextResponse.json({ message: "Poll not found" }, { status: 404 });
    }

    //Check if the user is the creator of the poll
    if (!poll.creator.userId.equals(user._id as Types.ObjectId)) {
      return NextResponse.json(
        { message: "Forbidden: Only the creator can edit this poll" },
        { status: 403 }
      );
    }

    //Check if the poll has any votes
    if(await pollHasVotes(poll)) {
      return NextResponse.json(
        { message: "Forbidden: A poll cannot be edited after it has received a vote." },
        { status: 403 }
      );
    }

    //Update the poll
    poll.title = title;

    poll.options = options.map((optionString: string): { text: string; votes: number } => ({
      text: optionString,
      votes: 0
    }));

    poll.updatedAt = new Date();
    if (uploadedImage) {
      const imageToDelete = poll.toObject().image;
      if (imageToDelete) {
        await bb_deleteFile(imageToDelete);
      }
      poll.image = uploadedImage;
    }

    await poll.save();

    return NextResponse.json(
      {
        message: "Poll updated successfully",
        poll: await publicPollFromPoll(poll, session),
      },
      { status: 200 }
    );
  } catch (e: unknown) {
    console.error("Error editing poll:", e);
    return NextResponse.json({ message: e instanceof Error ? e.message : "An unknown error occurred" }, { status: 500 });
  }
}

//Delete Poll
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const pollId = params.id;

    if (!isValidObjectId(pollId)) {
      return NextResponse.json({ message: "Invalid poll ID" }, { status: 400 });
    }

    await dbConnect();

    const session = await getSession();
    if (!session || !session._id) {
      //Note: User's authentication will already be checked with middleware, so session should never be null.
      //hence, if session or session id is null, we have an odd error.
      return NextResponse.json(
        { message: "An error occured while obtaining the session" },
        { status: 500 }
      );
    }

    //Verify that the user exists
    const user = await User.findById(session._id);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

        //Delete the poll from the database
    const deletedPoll = await Poll.findOneAndDelete({ _id: pollId, 'creator.userId': user._id });
    if (!deletedPoll) {
      return NextResponse.json({ message: "Poll not found or you are not the creator" }, { status: 404 });
    }

    //Delete the image from Backblaze if it exists
    const imageToDelete = deletedPoll.toObject().image;
    if (imageToDelete) {
      await bb_deleteFile(imageToDelete);
    }

    //Delete the Votes
    await Vote.deleteMany({
      pollId: pollId
    });

    return NextResponse.json({ message: "Poll deleted successfully" }, { status: 200 });
  } catch (e: unknown) {
    console.error("Error deleting poll:", e);
    return NextResponse.json({ message: e instanceof Error ? e.message : "An unknown error occurred" }, { status: 500 });
  }
}