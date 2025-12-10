"use client";

import React, { useEffect, useState } from "react";
import { PollOption } from "./addPollForm";


interface SimpleOption {
  text: string;
  votes: number;
}

interface VotedOptionsProps {
  options: SimpleOption[];
}

interface VotedOption extends SimpleOption {
  percentage: number;
}

const VotedOptions: React.FC<VotedOptionsProps> = ({ options }) => {
  const [votedOptions, setVotedOptions] = useState<VotedOption[]>([]);

  useEffect(() => {
    let totalVotes = 0;
    for (const option of options) {
      totalVotes += option.votes;
    }

    const safeTotal = totalVotes === 0 ? 1 : totalVotes;

  
    setVotedOptions(
      options.map((option) => ({
        text: option.text,
        votes: option.votes,
        percentage: Math.round((option.votes / safeTotal) * 100),
      }))
    );
  }, [options]);

  return (
    <>
      {votedOptions.map((option, index) => (
        <li key={index}>
          <div className="pol-result w-full h-full text-left">
            <div className="pol-result-content flex justify-between">
              <span className="pol-result-text w-full xl:w-3/4">
                {option.text}
              </span>
              <span className="pol-result-text text-right flex-1">
                {option.votes} vote{option.votes === 1 ? "" : "s"} (
                {option.percentage}%)
              </span>
            </div>
            <div
              className="pol-result-bar"
              style={{
                transition: "2s",
                width: `${option.percentage}%`,
              }}
            ></div>
          </div>
        </li>
      ))}
      {votedOptions.length === 0 && (
        <li className="pol-result-text text-sm italic mt-2">
          No votes yet.
        </li>
      )}
    </>
  );
};
export default VotedOptions;

