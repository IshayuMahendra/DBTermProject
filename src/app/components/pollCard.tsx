"use client";

import { faPencil, faRefresh, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useUser } from "../provider/userProvider";
import AddPollForm, { Poll, PollOption } from "./addPollForm";
import Modal from './modal';
import UnvotedOptions from "./unvotedOptions";
import VotedOptions from "./votedOptions";


interface PollCardProps {
  poll: Poll;
  onDelete: () => void;
  onUpdated: () => void;
}

interface PollOptionDto {
  optionId: number;
  text: string;
  votes: number;
}

interface PollDetailResponse {
  poll: {
    pollId: number;
    title: string;
  };
  options: PollOptionDto[];
  hasVoted?: boolean; //
}





const PollCard: React.FC<PollCardProps> = ({ poll, onDelete, onUpdated}: PollCardProps) => {

  const [alertMsg, setAlertMsg] = useState<undefined | string>(undefined);
  const { user, isLoggedIn } = useUser();
  const router = useRouter();

  const [options, setOptions] = useState<PollOptionDto[]>([]);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const loadDetails = async () => {
      try {
        let url = `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/polls/${poll.pollId}`;

       
        if (isLoggedIn && user && user.userId != null) {
          url += `?userId=${user.userId}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          console.error("Failed to load poll details", await res.text());
          return;
        }

        const data: PollDetailResponse = await res.json();
        setOptions(data.options);

        if (typeof data.hasVoted === "boolean") {
          setHasVoted(data.hasVoted);
        } else {

          setHasVoted(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadDetails();
  }, [poll.pollId]);

  const handleVote = async (optionIndex: number) => {
    if (!isLoggedIn || !user || user.userId == null) {
      setError("You must be logged in to vote.");
      return;
    }

    const option = options[optionIndex];
    if (!option) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/polls/${poll.pollId}/vote`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.userId,
            optionId: option.optionId
          })
        }
      );

      if (!res.ok) {
        const text = await res.text();
        setError(text);
        return;
      }

    
      setOptions((prev) =>
        prev.map((opt, idx) =>
          idx === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
        )
      );
      setHasVoted(true);
      setError(null);
      onUpdated();
    } catch (err: any) {
      setError(err.message ?? "Failed to vote.");
    }
  };

  const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);


 


  const submitVote = async (optionIndex: number) => {

  if (!isLoggedIn || !user || user.userId == null) {
    setAlertMsg("You must be logged in to vote.");
    return;
  }

  const option = options[optionIndex];
  if (!option) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/polls/${poll.pollId}/vote`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          optionId: option.optionId,
        }),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      setAlertMsg(text);
      return;
    }


    setOptions((prev) =>
      prev.map((opt, idx) =>
        idx === optionIndex ? { ...opt, votes: opt.votes + 1 } : opt
      )
    );
    setHasVoted(true);
    poll.hasVoted = true;
    poll.hasVotes = true;
    setAlertMsg(undefined);
  } catch (err: any) {
    setAlertMsg(err.message ?? "Failed to vote.");
  }
};


  return (
  <>
      <div
        className="bg-[#ff0000] pb-4 rounded text-lg font-mono border-solid border-1 border-[#ffce00]"
      >
          <div>
            <span className="text-xl">{poll.title}</span>
          </div>
          <div className="px-6">
          <div className="mb-4">
          {alertMsg && (
            <p className="text-red-400 mb-4 font-semibold">{alertMsg}</p>
          )}
        </div>
        <ul className="space-x-0 space-y-3 mt-3">
         {hasVoted ? (
       
         <VotedOptions options={options} />
         ) : (
     
        <UnvotedOptions
          options={options.map((opt) => opt.text)}
          onVote={(index) => submitVote(index)}
        />
        )} 
    
        </ul>
        {poll.isOwnPoll && (
          <div className="mt-4 ml-3">
            {
        
            }
            {!poll.hasVotes &&
            <button
              className=" mr-4 pol-iconbtn"
              onClick={() => {
                setAlertMsg(undefined);
              }}
            >
              <FontAwesomeIcon icon={faPencil}></FontAwesomeIcon>
            </button>
            }

 
            
              <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
        
          </div>
        )}
          </div>

      </div>

  

    </>
  );
};

export default PollCard;
