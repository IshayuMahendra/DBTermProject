"use client"
import Link from "next/link";
import { useUser } from "../provider/userProvider";


const LeftSidebar: React.FC = () => {
 
    const navItems = [
        { label: 'Home Page', path: '/home' },
        { label: 'Unvoted Polls', path: '/saved', requiresLogin: true },
        { label: 'Profile', path: '/profile', requiresLogin: true },
        { label: 'Settings', path: '/settings', requiresLogin: true },
    ];

    const user = useUser();
    return (
        <aside className="pol-sidebar h-full w-full py-4 px-8 border-[#ffce00] border-r-0 lg:border-r-1">
            <ul className="space-y-3 mt-2">
                {navItems.map((item, index) => (
                    <li key={index}>
                        {(!item.requiresLogin || user.isLoggedIn) &&
                            <Link
                                href={item.path}
                                className="block py-2 px-3 rounded-md transition-colors duration-200 hover:bg-[#121414] hover:text-white"
                            >
                                {item.label}
                            </Link>
                        }
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default LeftSidebar;
