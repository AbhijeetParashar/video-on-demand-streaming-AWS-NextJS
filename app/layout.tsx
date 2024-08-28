import Appbar from "@/components/Appbar";
import Providers from "@/components/Provider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VOD-AWS",
  description:
    "A Demo App For showcasing the video on demand streaming with Next JS and AWS services",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {" "}
        <Providers>
          <Appbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
