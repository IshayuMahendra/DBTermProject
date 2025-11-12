"use client";

import React, { useEffect, useState } from 'react';

interface TyperProps {
    typedString: string;
    msSpeed: number
};

const Typer: React.FC<TyperProps> = ({ typedString, msSpeed }: TyperProps) => {
    const [curString, setcurString] = useState(typedString[0]);

    useEffect(() => {
        if(curString.length < typedString.length) {
            let delayToUse: number = msSpeed;
            if(curString[curString.length-1] == ".") delayToUse = msSpeed*5;
            setTimeout(() => {
                setcurString((prev) => prev + (typedString[prev.length]));
            }, delayToUse);
        }
    }, [curString])

    return (
        <>
        {curString}
        </>
    );
};

export default Typer;