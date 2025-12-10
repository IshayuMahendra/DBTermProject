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


  useEffect(() => {
 
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoggedIn, setUser, setIsLoggedIn }}>
      {children}
    </UserContext.Provider>
  );
};

