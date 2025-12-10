import type { Metadata } from "next";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#F9ECE1" />
      </head>
      <body
        className={`min-h-screen antialiased bg-[#F9ECE1] overflow-x-hidden flex flex-col`}
      >
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
