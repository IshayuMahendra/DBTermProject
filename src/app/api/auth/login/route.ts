import dbConnect from "@/app/lib/db_connection";
import {createSession} from "@/app/lib/sessionManager";
import User, { IUser } from "@/models/userSchema";
import bcrypt from 'bcrypt';
import { Model, Document } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

//POST request to /api/auth/login
export async function POST(request: NextRequest) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ message: "Please provide all attributes in request" }, { status: 400 });
        }

        await dbConnect();

        const user: Model<IUser> & IUser & Document<IUser>|null = await User.findOne({username: username});

        if(!user) {
            return NextResponse.json({ message: "Username or password is incorrect." }, { status: 403 });
        }

        const saltedPassword = user.salted_password;
        
        if(await bcrypt.compare(password, saltedPassword)) {
            await createSession(user);
            return NextResponse.json({ message: "success", user: {
                username: user.username,
                display_name: user.display_name
            } }, { status: 200 });
        }
        return NextResponse.json({ message: "Username or password is incorrect." }, { status: 403 });

    } catch (e: unknown) {
        console.log(e);
        let message = "unknown error";
        if(e instanceof Error) {
            message = e.message;
        }
        return NextResponse.json({ message: message }, { status: 500 });
    }
}