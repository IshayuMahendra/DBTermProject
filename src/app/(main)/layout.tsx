import LeftSidebar from "../components/LeftBar"
import NavBar from "../components/navbar"

export const metadata = {
  title: 'UGA Pollss',
  description: 'A polling application for University of Georgia students to create and participate in polls',
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
                </div>
            </div>
  )
}
