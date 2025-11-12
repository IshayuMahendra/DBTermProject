"use client";

import React from "react";

interface UnvotedOptionsProps {
  options: string[];
  onVote: (optionIndex: number) => void;
}

//Main feed page that displaus all the polls
const UnvotedOptions: React.FC<UnvotedOptionsProps> = ({ options, onVote }: UnvotedOptionsProps) => {
  return (
    <>
          {options.map((option, index) => (
            <li key={index}><button className="pol-button w-full h-full text-left" onClick={() => onVote(index)}>{option}</button></li>
            ))}
    </>
  );
};

export default UnvotedOptions;
