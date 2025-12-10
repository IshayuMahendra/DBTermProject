"use client";

import React from "react";

interface UnvotedOptionsProps {
  options?: string[];                       
  onVote: (optionIndex: number) => void;
}


const UnvotedOptions: React.FC<UnvotedOptionsProps> = ({ options = [], onVote }) => {


  return (
    <>
      {options.map((option, index) => (
        <li key={index}>
          <button
            className="pol-button w-full h-full text-left"
            onClick={() => onVote(index)}
          >
            {option}
          </button>
        </li>
      ))}
    </>
  );
};

export default UnvotedOptions;


