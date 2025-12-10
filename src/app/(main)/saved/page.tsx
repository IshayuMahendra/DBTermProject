"use client";

import React from "react";
import PollList from "@/app/components/pollList";
import "@/app/styles/global_styles.css";

const SavedPage: React.FC = () => {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full md:w-2/3 lg:w-1/2 p-6">
        <h1 className="text-2xl font-mono mb-4">Unvoted Polls</h1>
        <PollList collectionType="saved" />
      </div>
    </div>
  );
};

export default SavedPage;