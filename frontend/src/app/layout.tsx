import type { Metadata } from 'next'
import './assets/css/globals.css'
import './assets/css/notailwind.css'

export const metadata: Metadata = {
    title: 'UniMaven',
    description: 'Virtual Maven Repository for CurseForge, Modrinth, GitHub and NightBloom',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang='en' className={'w-full h-full dark'}>
            <body className={`antialiased w-full h-full`}>{children}</body>
        </html>
    )
}
