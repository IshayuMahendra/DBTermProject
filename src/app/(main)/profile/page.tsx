"use client";

import '@/app/styles/global_styles.css';
import React from 'react';
import PollList from '../../components/pollList';
import ProtectedRoute from '../../helper/protectedRoute';

//Home page with flex colummns and then scrolls vertically when on mobile
const ProfilePage: React.FC = () => {
    return (
        <ProtectedRoute>
            <PollList collectionType='profile' />
        </ProtectedRoute>
    );
};

export default ProfilePage;
