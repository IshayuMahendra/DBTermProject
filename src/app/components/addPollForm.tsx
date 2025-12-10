"use client";
import { faHatWizard, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useUser } from "../provider/userProvider";


export interface LocalPoll {
  title: string;
  options: string[]
}

export interface PollOption {
  text: string;
  votes: number;
}


export interface Poll {
  pollId: string;
  title: string;
  options: string[];
  results?: PollOption[];
  createdAt: string;
  isOwnPoll?: boolean;
  hasVoted: boolean;
  hasVotes: boolean;
}

interface AddPollFormProps {
  onCompletion: (data: Poll) => void;
  pollToEdit?: Poll;
}

const AddPollForm: React.FC<AddPollFormProps> = ({ onCompletion, pollToEdit }) => {
  const [question, setQuestion] = useState(pollToEdit ? pollToEdit.title : "");
  const [options, setOptions] = useState(pollToEdit ? pollToEdit.options:[""] );
  const [error, setError] = useState<string|undefined>(undefined);
  const { user, isLoggedIn } = useUser();


  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleAddOption = () => {
    if (options.length >= 4) return;
    setOptions([...options, ""]);
  };

  const handleDeleteOption = (index: number) => {
    if (options.length <= 2) return;
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
  };

const handleNewPoll = async (localPoll: { title: string; options: string[];}) => {
  if (!isLoggedIn || !user || user.userId == null) {
    setError("You must be logged in to create a poll.");
    return;
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/polls`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: localPoll.title,
        options: localPoll.options,
        creatorId: user.userId,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      setError(text);
      return;
    }

    const data = await res.json(); 

    const newPoll: Poll = {
      pollId: data.pollId,
      title: localPoll.title,
      options: localPoll.options,
      createdAt: new Date().toISOString(),
      isOwnPoll: true,
      hasVoted: false,
      hasVotes: false,
      results: [],
    };

    onCompletion(newPoll);  
  } catch (err: any) {
    setError(err.message ?? "Failed to create poll.");
  }
};

 

  const handleEditPoll = (id:string, localPoll: LocalPoll) => {
    const formData = new FormData();
    formData.append('question', localPoll.title);
    localPoll.options.forEach((option) => formData.append('option', option))
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/poll/${id}`, {
      method: "PUT",
      body: formData
    }).then(async (res: Response) => {
      const jsonData = await res.json();
      if (res.status == 200) {
        const editedPoll: Poll = jsonData["poll"];
        onCompletion(editedPoll);
      } else {
        setError(jsonData["message"]);
      }
    }).catch((error: Error) => {
      setError(error.message);
    });

  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    const cleanedOptions = options.filter((opt) => opt.trim() !== "");
    if (cleanedOptions.length < 2) {
      setError("Please provide at least 2 valid options.");
      return;
    }

    if (!question) {
      setError("Please provide a question!");
      return;
    }

    const localPoll = {
      title: question,
      options: cleanedOptions,
    };

    if(pollToEdit) {
      handleEditPoll(pollToEdit.pollId, localPoll);
      return;
    }
    handleNewPoll(localPoll);
  }

  const generatePoll = async () => {
      fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/ai/suggest_poll`, {
        method: 'GET'
      }).then(async (r) => {
        const jsonData = await r.json();
        if(r.status == 200) {
          setQuestion(jsonData.title);
          setOptions(jsonData.options);
        } else {
          setError(jsonData.message);
        }
      }).catch((e) => {
        if(e instanceof Error) {
          setError(e.message);
          return;
        }
        setError("unknown error");
      })
  };

  return (
    <>
            <span className="text-white text-lg mb-6">Create/Edit Poll</span>
      <form
        onSubmit={handleSubmit}
        className="w-full text-white px-6 font-mono relative mt-6"
      >
        <div className="flex flex-col sm:flex-row w-full items-center mb-6 gap-2">
          <input
            type="text"
            placeholder="What’s your question?"
            className="w-full flex-1 p-3 text-black bg-gray-300 rounded placeholder:text-black"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button className="pol-button pol-button-form mt-0" onClick={(e) => {
            e.preventDefault();
            generatePoll();
          }}><FontAwesomeIcon icon={faHatWizard}></FontAwesomeIcon> Generate</button>
        </div>

        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center mb-4 gap-2">
            <span className="w-6">{String.fromCharCode(65 + idx)}.</span>
            <input
              type="text"
              value={opt}
              placeholder={idx === 1 ? "Start typing your next option here.." : ""}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              className="flex-1 p-3 text-black bg-gray-300 rounded placeholder:text-black"
            />
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => handleDeleteOption(idx)}
                className="text-gray-300 hover:text-white"
                title="Remove option"
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            )}
          </div>
        ))}

        {error && (
          <p className="text-red-400 mb-4 font-semibold">{error}</p>
        )}

        <div className="flex justify-between items-center mt-4">
          {options.length < 4 && (
            <button
              type="button"
              onClick={handleAddOption}
              className="pol-button pol-button-slim"
            >
              + Add Option
            </button>
          )}

          <button
            type="submit"
            className="pol-button pol-button-slim  ml-auto"
          >
            Submit
          </button>
        </div>
      </form>
    </>
  );
};

export default AddPollForm;
