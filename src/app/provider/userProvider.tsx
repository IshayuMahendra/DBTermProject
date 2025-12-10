"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode,} from "react";

type User = {
  username: string;
  displayName: string;
  userId?: number;
};

type UserContextType = {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  setIsLoggedIn: (value: boolean) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return ctx;
};

export const useUser = useUserContext;

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  // TODO: implement real session check with Java backend later
  useEffect(() => {
    // For now, start logged out and let loginForm set user + isLoggedIn
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn, setUser, setIsLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

/*
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
    // TODO: implement real session check later with Java backend
  }, [])
  //   fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/auth`, {
  //     method: 'POST'
  //   }).then(async (response: Response) => {
  //     const jsonData = await response.json();
  //     setIsLoggedIn(jsonData.loggedIn);

  //     if (jsonData.loggedIn) {
  //       setUser({
  //         username: jsonData.user["username"],
  //         displayName: jsonData.user["display_name"]
  //       });
  //     }

  //     setIsInit(true);
  //   })
  // }, [])

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
*/