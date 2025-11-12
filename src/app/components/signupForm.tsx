"use client";
import React, { FormEvent, useState } from 'react';
interface SignupFormProps {
onNewUser: () => void
};

const SignupForm: React.FC<SignupFormProps> = ({onNewUser}) => {
    const [displayName, setDisplayName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [alertValue, setAlert] = useState<string | null>(null);

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        setAlert(null);
        fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password,
                display_name: displayName
            })
        }).then(async (response: Response) => {
            const jsonData = await response.json();
            if (response.status == 201) {
                onNewUser();
            } else {
                setAlert(jsonData.message);
            }
        }).catch(async (error: Error) => {
            setAlert(error.message);
        })
    }

    return (
        <div className="text-center">
            {alertValue &&
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{alertValue}</span>
                </div>
            }
            <div className="text-center">
                        <h2>Sign Up</h2>
                        <form className="mt-4" onSubmit={handleFormSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Name</label>
                                <input type="text" id="signup-name" className="mt-1 p-2 w-full border rounded" onChange={(e) => setDisplayName(e.target.value)} required/>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Username</label>
                                <input type="text" id="signup-username" className="mt-1 p-2 w-full border rounded" onChange={(e) => setUsername(e.target.value)} required/>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium">Password</label>
                                <input type="password" id="signup-password" className="mt-1 p-2 w-full border rounded" onChange={(e) => setPassword(e.target.value)} required/>
                            </div>
                            <button type="submit" className="pol-button">Submit</button>
                        </form>
                    </div>
        </div>
    );
};

export default SignupForm;