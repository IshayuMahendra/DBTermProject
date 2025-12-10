import { UserProvider } from "./provider/userProvider"

export const metadata = {
  title: 'UGA Polls',
  description: 'A polling application for University of Georgia students to create and participate in polls',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
        </body>
    </html>
  )
}
