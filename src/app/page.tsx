"use client";

import '@/app/styles/global_styles.css';
import '@/app/styles/splash.css';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Modal from './components/modal';
import Typer from './components/typer';
import { useUser } from './provider/userProvider';
const bg = "/img/splashBG.jpg";

const SplashPage: React.FC = () => {
    const [showModal, setShowModal] = useState(false);
    const { isLoggedIn } = useUser();
    const router = useRouter();

    useEffect(() => {
        if(isLoggedIn) {
            router.push("/home");
        }
    }, [isLoggedIn]);

    return (
                    <div className="splash">
            <div className="splash-left-corner">
                <button className="pol-button pol-button-circle inline-block" onClick={() => {
                    setShowModal(true);
                }}>?</button>
            </div>
            <div className="splash-content">
                <h1>UGAPolls</h1>
                <p>A polling site for Database classmates!</p>
                <div className="mt-4 block">
                    <Link className="pol-button inline-block" href="/home">Main Page</Link>
                </div>
            </div>
            {showModal &&
                <Modal onDismiss={() => setShowModal(false)} transitionSeconds={0.3}>
                    <div className="text-center" style={{maxWidth: 650}}>
                        <h2>Info</h2>
                        <p className="mt-4">This project is a fresh take on a student polling site using an SQL dataset. Users can create, delete, update and vote on polls that everyone using the site can participate in. It's primarily for sharing with our Database course.</p>
                    </div>
                </Modal>
            }
            <Image src={bg} className="splash-img" alt="test" fill />
        </div>
    );
};

export default SplashPage;