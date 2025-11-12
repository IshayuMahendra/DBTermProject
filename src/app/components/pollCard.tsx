"use client";

import { faPencil, faRefresh, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
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

//Main feed page that displaus all the polls
const PollCard: React.FC<PollCardProps> = ({ poll, onDelete, onUpdated}: PollCardProps) => {
  const [isBeingEdited, setIsBeingEdited] = useState(false);
  const [alertMsg, setAlertMsg] = useState<undefined | string>(undefined);
  const user = useUser();
  const router = useRouter();

  //Delete poll function 
  const handleDeletePoll = () => {
    setAlertMsg(undefined);
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/poll/${poll.id}`, {
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

  const submitVote = (index: number) => {
    setAlertMsg("");
    if(process.env.NEXT_PUBLIC_CAN_VOTE_ANONYMOUSLY != "true" && !user.isLoggedIn) {
      const errorParams = new URLSearchParams();
      errorParams.set("login", "true");
      errorParams.set("error", "You must be logged in to do that.")
      router.push(`/home?${errorParams.toString()}`);
      return;
    }
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/poll/${poll.id}/vote`, {
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

  const doRefresh = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/poll/${poll.id}`, {
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
        className="bg-[#1E4147] pb-4 rounded text-lg font-mono border-solid border-1 border-[#AAC789]"
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
        {poll.hasVoted && poll.results && poll.results.length > 0 ? 
        <VotedOptions options={poll.results}></VotedOptions>
        :
        <UnvotedOptions options={poll.options} onVote={(index) => submitVote(index)}></UnvotedOptions>
      }
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
          bgColor="#1E4147"
          fgColor="#FFF"
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
