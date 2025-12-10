'use client'

import NavBar from "./components/navbar"
import '@/app/styles/global_styles.css';

//This is the 404 page
export default function NotFound() {
    return (

        <div className="h-full flex flex-col ">
            <NavBar />
        
    
                <main className="ml-auto mr-auto flex-1 p-6 mt-80 text-[#fff5c3]">
                    <h1 className="text-white">404 CAN'T FIND THAT PAGE</h1>
                </main>
              

        </div>

    );
}

