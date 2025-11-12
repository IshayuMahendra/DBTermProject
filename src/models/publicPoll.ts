"use server";

import { UserSession } from "@/app/lib/sessionManager";
import { IPoll } from "./pollSchema";
import Vote from "./voteSchema";

export interface PublicPoll {
    id: string|unknown,
    title: string,
          options: string[],
          results?: {
            text: string;
            votes: number;
          }[],
          createdAt: Date,
          imageURL: string,
          isOwnPoll: boolean,
          hasVoted: boolean,
          hasVotes?: boolean
}

export async function pollHasVotes(poll: IPoll) {
  for(const option of poll.options) {
    if(option.votes > 0) {
      return true;
    }
  }
  return false;
}

export async function publicPollFromPoll(poll: IPoll, session: UserSession|null|undefined) {

    const publicPoll: PublicPoll = {
      id: poll._id,
      title: poll.title,
      options: poll.options.map((option) => option.text),
      createdAt: poll.createdAt,
      imageURL: poll.image?.publicURL,
      isOwnPoll: poll.creator.userId == session?._id,
      hasVoted: false,
    }

    //If the user has voted already, show them the results, otherwise show them the options
    if(session) {
        publicPoll.hasVotes = await pollHasVotes(poll);

        const hasVoted: boolean = await Vote.findOne({pollId: poll._id, userId: session._id}) != null;
        if(hasVoted == true) {
            publicPoll.hasVoted = true;
            publicPoll.results = poll.options;
        }
    }
    
    return publicPoll;
}