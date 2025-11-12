"use client";

import React, { useState } from 'react';

const Button1: React.FC = () => {
    const [show, setShow] = useState(false);

    return (
        <>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700" onClick={() => setShow(true)}>
                Hello World
            </button>
            {show && <p className="mt-2 text-gray-700">Button was clicked!</p>}
        </>
    );
};

export default Button1;