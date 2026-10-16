import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Football Players App',
  description: 'Manage your football players data',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
