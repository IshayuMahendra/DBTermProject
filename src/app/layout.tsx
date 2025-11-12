import { UserProvider } from "./provider/userProvider"

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
    <html lang="en">
      <body>
        <UserProvider>
          {children}
        </UserProvider>
        </body>
    </html>
  )
}
