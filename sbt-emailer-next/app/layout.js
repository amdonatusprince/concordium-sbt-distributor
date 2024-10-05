import './globals.css'

export const metadata = {
  title: 'SBT Award Emailer',
  description: 'Easily mint collection on Concordium',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
