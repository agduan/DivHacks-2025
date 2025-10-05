import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "finosaur.ai",
  description: "See your financial future with AI-powered forecasting",
  icons: {
    icon: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-retro-dark text-white antialiased">
        {children}
      </body>
    </html>
  );
}

