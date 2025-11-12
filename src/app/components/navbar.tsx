"use client";

import { faQrcode, faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useUser } from "../provider/userProvider";
import LoginForm from "./loginForm";
import Modal from "./modal";
import SignupForm from "./signupForm";
import Image from "next/image";

//Nav bar, removes logout, user name and profile if use is not logged in
const NavBar: React.FC = () => {
    const userProvider = useUser();
    const searchParams = useSearchParams()
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (searchParams.get('login') == 'true') {
            setShowLoginModal(true);
        }
    }, [searchParams])

    const [showSignupModal, setShowSignupModal] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showQR, setShowQR] = useState(false);

    const doLogout = () => {
        fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/api/auth/logout`, {
            method: 'POST'
        }).then(async (response: Response) => {
            if (response.status == 200) {
                router.push("/home");
                userProvider.setUser(undefined);
                userProvider.setIsLoggedIn(false);
            }
        })
    };

    return (
        <nav className="h-20 px-8 py-4 bg-[#0E2A2D] text-[#AAC789] flex border-solid border-[#667753] border-b-1">
            <div className="w-1/2 text-lg sm:text-4xl font-mono mt-auto mb-auto"> <Link href="/home" className="cursor-pointer hover:underline">Pollster.</Link></div>

            <div className="w-1/2 flex">
                <div className="ml-auto space-x-3 md:space-x-6 flex items-center">
                    {userProvider.isLoggedIn ?
                    <>
                    <button className="pol-iconbtn" onClick={() => setShowQR(true)}>
                                <FontAwesomeIcon icon={faQrcode}></FontAwesomeIcon>
                            </button>
                        <span className="hidden md:inline-block">Hello, {userProvider.user?.displayName}</span>
                        <img className="inline-block rounded-full border-3 h-full" src="img/avatar.webp"></img>
                        <button className="pol-iconbtn" onClick={doLogout}>
                            <FontAwesomeIcon icon={faRightFromBracket}></FontAwesomeIcon>
                        </button>
                    </>
                    :
                    <>
                    <button className="pol-button pol-button-slim" onClick={() => setShowLoginModal(true)}>Login</button>
                    <button className="pol-button pol-button-slim" onClick={() => setShowSignupModal(true)}>Sign Up</button>
                    </>
                    }
                    {showLoginModal &&
                        <Modal onDismiss={() => {
                            setShowLoginModal(false);
                            router.push(pathname);
                        }} transitionSeconds={0.3}>
                            <LoginForm onLogin={() => setShowLoginModal(false)} initialError={searchParams.get('error')}></LoginForm>
                        </Modal>
                    }
                    {showSignupModal &&
                        <Modal onDismiss={() => setShowSignupModal(false)} transitionSeconds={0.3}>
                            <SignupForm onNewUser={() => {
                                setShowSignupModal(false);
                                setShowLoginModal(true);
                            }} />
                        </Modal>
                    }
                    {showQR && (
                        <Modal
                            onDismiss={() => setShowQR(false)}
                            transitionSeconds={0.3}
                            bgColor="#1E4147"
                            fgColor="#FFF"
                        >
                            <div className="pol-modal-large">
                                <Image
                                    src={"/img/qr.svg"}
                                    alt={"QR Code linking back to pollster.kendrick.to"}
                                    width={0}
                                    height={0}
                                    sizes="100vw"
                                    style={{ width: '100%', height: 'auto' }} // optional
                                    className="bg-[#AAC789]"
                                />
                            </div>
                        </Modal>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
