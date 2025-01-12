import type { Metadata } from 'next'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import Layout from './components/Layout'
import './globals.css'

const manifestUrl = 'https://your-app-url.vercel.app/tonconnect-manifest.json'

export const metadata: Metadata = {
  title: 'ZOA.fund',
  description: 'Zero-to-One Accelerator'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          <Layout>{children}</Layout>
        </TonConnectUIProvider>
      </body>
    </html>
  )
}