import type { Metadata } from 'next'
import { TelegramProvider } from '@/app/contexts/TelegramContext'
import Layout from './components/Layout'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZOA.fund',
  description: 'Zero-to-One Accelerator',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TelegramProvider>
          <Layout>{children}</Layout>
        </TelegramProvider>
      </body>
    </html>
  )
}