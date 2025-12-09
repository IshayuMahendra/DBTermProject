"use client";
import React, { FormEvent, useState } from 'react';
import { useUser } from '../provider/userProvider';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
    onLogin: () => void;
    initialError?: string|null;
}

const LoginForm: React.FC<LoginFormProps> = ({onLogin, initialError}) => {
    const userContext = useUser();
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [alert, setAlert] = useState<string | null>(initialError ? initialError : "");

    const handleFormSubmit = (e: FormEvent) => {
        e.preventDefault();
        setAlert(null);
        fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username,
                password
            })
        }).then(async (response: Response) => {
            if (response.ok) {
                const jsonData = await response.json();
                console.log(jsonData);

                // Java/spring boot returns { userId, username, displayName }
                userContext.setUser({
                    username: jsonData.username,
                    displayName: jsonData.displayName,
                    userId: jsonData.userId
                });

                userContext.setIsLoggedIn(true);
                setAlert(null);
                onLogin();
                router.push("/home");
            } else {
                const text = await response.text();
                setAlert(text);
            }
        }).catch((error: Error) => {
            setAlert(error.message);
        })
    }
    
    return (
        <div className="text-center" style={{maxWidth: 300}}>
            {alert &&
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <span className="block sm:inline">{alert}</span>
                </div>
            }
            <h2>Login</h2>
            <form className="mt-4" onSubmit={handleFormSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Username</label>
                    <input type="text" id="login-username" className="mt-1 p-2 w-full border rounded" onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium">Password</label>
                    <input type="password" id="login-password" className="mt-1 p-2 w-full border rounded" onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="pol-button">Submit</button>
            </form>
        </div>
    );
};

export default LoginForm;