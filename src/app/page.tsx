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
                <h1>Pollster</h1>
                <p><Typer typedString="your vote. your polls. your impact." msSpeed={40}></Typer></p>
                <div className="mt-4 block">
                    <Link className="pol-button inline-block" href="/home">Enter</Link>
                </div>
            </div>
            {showModal &&
                <Modal onDismiss={() => setShowModal(false)} transitionSeconds={0.3}>
                    <div className="text-center" style={{maxWidth: 650}}>
                        <h2>about us</h2>
                        <p className="mt-4">This project aims to create a social media-like service involving polls. Users can create a poll and post it on to a universal feed that others can then vote on. These polls can range from professors, classes or events at UGA. The goal of this project is to give students an easier way to share their opinion and become informed about how their peers are feeling about life on campus.</p>
                    </div>
                </Modal>
            }
            <Image src={bg} className="splash-img" alt="test" fill />
        </div>
    );
};

export default SplashPage;