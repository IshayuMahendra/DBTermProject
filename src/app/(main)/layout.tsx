import LeftSidebar from "../components/LeftBar"
import NavBar from "../components/navbar"
import RightSidebar from "../components/RightBar"

export const metadata = {
  title: 'Pollster',
  description: 'your vote. your polls. your impact.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="pol-home h-full flex flex-col">
                <NavBar />
                {/* flex-1 allows rest of space to be filled */}
                <div className="flex-1 flex flex-col lg:flex-row w-full">
                    {/* Left Sidebar */}
                    <div className="w-full lg:w-1/4 xl:w-1/5">
                        <LeftSidebar />
                    </div>

                    {/* Main Content */}
                    <main className="flex-1">
                    {children}
                    </main>

                    {/* Right Sidebar */}
                    <div className="w-full lg:w-1/4 xl:w-1/5">
                        <RightSidebar />
                    </div>
                </div>
            </div>
  )
}
