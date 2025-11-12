"use server";

import { cookies } from 'next/headers';
import { IUser } from '@/models/userSchema';
import { Model } from 'mongoose';
import jwt from 'jsonwebtoken';
import { jwtVerify } from 'jose';

export interface UserSession {
    _id: unknown;
}

export async function createSession(user: Model<IUser> & IUser) {
    const session: UserSession = {
        _id: user._id
    }

    if(process.env.JWT_SECRET == undefined) {
        throw new Error("JWT_SECRET must be defined in .env file");
    }

    const token = jwt.sign(session, process.env.JWT_SECRET, {});
    (await cookies()).set('pollster_token', token, {httpOnly: true, sameSite: 'strict'});
}

export async function getSession(): Promise<UserSession|undefined> {
    const sessionToken: string|undefined = (await cookies()).get('pollster_token')?.value;
    if(!sessionToken) {
        return undefined;
    }

    if(process.env.JWT_SECRET == undefined) {
        throw new Error("JWT_SECRET must be defined in .env file");
    }

    try {
        const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);

        const { payload } = await jwtVerify<UserSession>(
            sessionToken,
            secretKey,
            {
            algorithms: ['HS256'], // Or 'RS256' if using RSA keys
            }
        );

        return payload;
    } catch(e) {
        console.log(e);
        return undefined;
    }
}

export async function destroySession() {
    const sessionID: string|undefined = (await cookies()).get('pollster_token')?.value;
    if(!sessionID) {
        return true;
    }
    (await cookies()).delete('pollster_token');
    return true;
}