import dbConnect from "@/app/lib/db_connection";
import User from "@/models/userSchema";
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from "next/server";


//POST request to /api/auth/register
export async function POST(request: NextRequest) {
    try {
        const { username, password, display_name } = await request.json();

        if (!username || !password || !display_name) {
            return NextResponse.json({ message: "Please provide all attributes in request" }, { status: 400 });
        }

        if(password.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
        }

        await dbConnect();

        const foundUser = await User.findOne({username: username});
        if(foundUser) {
            return NextResponse.json({ message: "Username already exists" }, { status: 400 });
        }

        //Hash password along with 10 salt rounds.
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username, salted_password: hashedPassword, display_name
        });

        return NextResponse.json({ message: "success" }, { status: 201 });
    } catch (e: unknown) {
        console.log(e);
        let message = "unknown error";
        if(e instanceof Error) {
            message = e.message;
        }
        return NextResponse.json({ message: message }, { status: 500 });
    }
}