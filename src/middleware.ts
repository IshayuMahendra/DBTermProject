import { NextResponse } from 'next/server';
import { getSession } from './app/lib/sessionManager';

export async function middleware() {
    const session = await getSession();
    if (!session || !session._id) {
        return NextResponse.json({ message: "User is not logged in." }, { status: 401 });
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/api/demo_protected_route', '/api/ai/:path*', '/api/poll/:id', '/api/poll/create', '/api/profile'],
}