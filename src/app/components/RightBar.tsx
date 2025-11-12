"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";

//Right side bar displaying the account options
const RightSidebar: React.FC = () => {
  interface TopUser {
    userId: string;
    displayName: string;
    count: number;
  }

  const [topUsers, setTopUsers] = useState<TopUser[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/stats`, {
      method: "GET"
    }).then(async (res: Response) => {
      const jsonData = await res.json();
      if (res.status == 200) {
        const topUsers: TopUser[] = jsonData;
        setTopUsers(topUsers);
      } else {
        console.log("Unable to fetch top users");
      }
    }).catch((error: Error) => {
      console.log(error);
    });
  }, []);

  return (
    <aside className="pol-sidebar h-full w-full py-4 px-8 border-[#667753] border-l-0 lg:border-l-1">
      <div className="text-md font-semibold mb-6 mt-2">Top Contributors</div>
      <ul className="space-y-5">
        {/*Mapping the array to a list -Ishayu */}
        {topUsers.map((topUser, index) => (
          <li key={index} className="flex items-center space-x-4">
            <Image
              src={"/img/avatar.webp"}
              alt={topUser.displayName}
              width={50}
              height={50}
              className="w-12 h-12 rounded-full object-cover border border-[#AAC789]"
            />
            <div className="flex flex-col">
              <span className="font-medium">{topUser.displayName}</span>
              <span className="text-sm text-[#88a27b]">{topUser.count} contribution(s)</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default RightSidebar;
