import dbConnect from "@/app/lib/db_connection";
import { getSession } from "@/app/lib/sessionManager";
import User from "@/models/userSchema";
import { NextResponse } from "next/server";

//POST /api/auth
//This endpoint returns the current authentication status of the user, as well as public user attributes, based upon their JWT cookie.
export async function POST() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ loggedIn: false }, { status: 200 });
        }

        await dbConnect();
        const user = await User.findById(session._id);
        if (!user) {
            return NextResponse.json({ loggedIn: false }, { status: 200 });
        }

        return NextResponse.json({
            loggedIn: true, user: {
                username: user.username,
                display_name: user.display_name
            }
        }, { status: 200 });
    } catch (e) {
        console.log(e);
        let message = "unknown error";
        if(e instanceof Error) {
            message = e.message;
        }
        return NextResponse.json({ message: message }, { status: 500 });
    }
}