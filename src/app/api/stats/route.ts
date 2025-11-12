import Poll from "@/models/pollSchema";
import User from "@/models/userSchema";
import { NextResponse } from "next/server";

//GET /api/stats
//Return the leaderboard of users sorted by the number of polls they have contributed.
export async function GET() {
    try {
        const stats = await Poll.aggregate().sortByCount("creator.userId");
        const publicStats = [];
        for(const entry of stats) {
            const user = await User.findById(entry._id);
            if(user) {
                publicStats.push({
                    userId: user._id,
                    displayName: user.display_name,
                    count: entry.count
                })
            }
        }
        return NextResponse.json(publicStats, { status: 200 });
    } catch (e: unknown) {
        console.log(e);
        let message = "unknown error";
        if(e instanceof Error) {
            message = e.message;
        }
        return NextResponse.json({ message: message }, { status: 500 });
    }
}