"use client";
import React, { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

interface User {
  username: string;
  displayName: string;
}

interface ContextProps {
  isLoggedIn: boolean,
  setIsLoggedIn: Dispatch<boolean>,
  user?: User,
  setUser: Dispatch<SetStateAction<User|undefined>>
}

const UserContext = createContext<ContextProps>({
  isLoggedIn: false,
  setIsLoggedIn: (() => { return null }),
  user: undefined,
  setUser: (() => { return null })
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isInit, setIsInit] = useState(false);

  //Set initial state
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/auth`, {
      method: 'POST'
    }).then(async (response: Response) => {
      const jsonData = await response.json();
      setIsLoggedIn(jsonData.loggedIn);

      if (jsonData.loggedIn) {
        setUser({
          username: jsonData.user["username"],
          displayName: jsonData.user["display_name"]
        });
      }

      setIsInit(true);
    })
  }, [])

  return (
    <>
    {isInit &&
      <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn, user, setUser }}>
      {children}
    </UserContext.Provider>
    }
    </>
  );
};

export const useUser = () => {
  return useContext(UserContext);
};