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
}

interface PollCardProps {
  poll: Poll;
  onDelete: () => void;
  onUpdated: () => void;
}


//Main feed page that displaus all the polls
const PollCard: React.FC<PollCardProps> = ({ poll, onDelete, onUpdated}: PollCardProps) => {
  const [isBeingEdited, setIsBeingEdited] = useState(false);
  const [alertMsg, setAlertMsg] = useState<undefined | string>(undefined);
  const { user, isLoggedIn } = useUser();
  const router = useRouter();

  const [options, setOptions] = useState<PollOptionDto[]>([]);
  const [hasVoted, setHasVoted] = useState<boolean>(poll.hasVoted);
  const [error, setError] = useState<string | null>(null);

  // Load poll options from backend
  useEffect(() => {
    const loadDetails = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/polls/${poll.pollId}`
        );
        if (!res.ok) {
          console.error("Failed to load poll details", await res.text());
          return;
        }
        const data: { poll: any; options: PollOptionDto[] }= await res.json();
        setOptions(data.options);
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

      // Optimistically update vote count and mark as voted
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


  //Delete poll function 
  const handleDeletePoll = () => {
    setAlertMsg(undefined);
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/poll/${poll.pollId}`, {
      method: 'DELETE'
    })
      .then(async (res: Response) => {
        const jsonData = await res.json();
        if (res.status == 200) {
          onDelete();
        } else {
          setAlertMsg(jsonData.message);
        }
      }).catch((error: Error) => {
        setAlertMsg(error.message);
      })
  }


  const submitVote = async (optionIndex: number) => {
  // make sure user is logged in
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

    // success: update local votes + mark as voted (like the original did)
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

  /*
  const submitVote = (index: number) => {
    setAlertMsg("");
    if(process.env.NEXT_PUBLIC_CAN_VOTE_ANONYMOUSLY != "true" && !isLoggedIn) {
      const errorParams = new URLSearchParams();
      errorParams.set("login", "true");
      errorParams.set("error", "You must be logged in to do that.")
      router.push(`/home?${errorParams.toString()}`);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/poll/${poll.pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({
        optionIndex: index
      })
    })
      .then(async (res: Response) => {
        const jsonData = await res.json();
        if (res.status == 200) {
          const pollResults: PollOption[] = jsonData.results;
          poll.results = pollResults;
          poll.hasVoted = true;
          poll.hasVotes = true;
          onUpdated();
        } else {
          setAlertMsg(jsonData.message);
        }
      }).catch((error: Error) => {
        setAlertMsg(error.message);
      })
  }
  */

  const doRefresh = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/poll/${poll.pollId}`, {
      method: 'GET'
    })
      .then(async (res: Response) => {
        const jsonData = await res.json();
        if (res.status == 200 && jsonData.poll) {
          const newPoll: Poll = jsonData.poll;
          poll.results = newPoll.results;
          poll.title = newPoll.title;
          poll.options = newPoll.options;
          onUpdated();
        } else {
          setAlertMsg(jsonData.message);
        }
      }).catch((error: Error) => {
        setAlertMsg(error.message);
      })
  }

  return (
    <>
      <div
        className="bg-[#ff0000] pb-4 rounded text-lg font-mono border-solid border-1 border-[#ffce00]"
      >
          <div className="pol-poll-header rounded px-7" style={{backgroundImage: poll.imageURL ? `
             linear-gradient(
      rgba(0, 0, 0, 0.65),
      rgba(0, 0, 0, 0.65)
    ),
            url(${poll.imageURL})
            `:''}}>
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
        // after voting: show results from backend
        <VotedOptions options={options} />
        ) : (
        // before voting: show option texts, mapped from backend objects
        <UnvotedOptions
          options={options.map((opt) => opt.text)}
          onVote={(index) => submitVote(index)}
        />
        )} 
        {/* {poll.hasVoted && poll.results && poll.results.length > 0 ? 
        <VotedOptions options={poll.results}></VotedOptions>
        :
        <UnvotedOptions options={poll.options} onVote={(index) => submitVote(index)}></UnvotedOptions>
      } */}
        </ul>
        {poll.isOwnPoll && (
          <div className="mt-4 ml-3">
            {
            /*Edit Button */
            }
            {!poll.hasVotes &&
            <button
              className=" mr-4 pol-iconbtn"
              onClick={() => {
                setAlertMsg(undefined);
                setIsBeingEdited(true);
              }}
            >
              <FontAwesomeIcon icon={faPencil}></FontAwesomeIcon>
            </button>
            }

            {/*Delete button */}
            <button
              className="pol-iconbtn mr-4"
              onClick={() => {
                handleDeletePoll()
              }}
            >
              <FontAwesomeIcon icon={faTrash}></FontAwesomeIcon>
            </button>
            <button
              className="mr-4 pol-iconbtn"
              onClick={doRefresh}
            >
              <FontAwesomeIcon icon={faRefresh}></FontAwesomeIcon>
            </button>
          </div>
        )}
          </div>

      </div>

      {/*This is the editing modal */}
      {isBeingEdited && (
        <Modal
          onDismiss={() => setIsBeingEdited(false)}
          transitionSeconds={0.3}
          bgColor="#ff0000"
          fgColor="#ff9a00"
        >
          <div className="pol-modal-large">
            <AddPollForm onCompletion={(editedPoll) => {
              setIsBeingEdited(false);
              poll.title = editedPoll.title;
              poll.options = editedPoll.options;
              poll.imageURL = editedPoll.imageURL;
              if(editedPoll.results) {
                poll.results = editedPoll.results;
              }
              onUpdated();
            }} pollToEdit={poll} />
          </div>
        </Modal>
      )}
    </>
  );
};

export default PollCard;
