"use client";

import '@/app/styles/global_styles.css';
import React from 'react';
import PollList from '../../components/pollList';

//Home page with flex colummns and then scrolls vertically when on mobile
const HomePage: React.FC = () => {
    return (
                        <PollList collectionType='home' />
    );
};

export default HomePage;
