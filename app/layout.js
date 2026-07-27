import localFont from "next/font/local";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner";
import { dbConnect } from "@/service/mongo";

// The application reads MongoDB and session data at request time.
// Prevent Next.js from querying external services during static prerendering.
export const dynamic = "force-dynamic";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "Easy Learning Academy - Best Online Professional Courses",
  description: "Best Online Professional Courses",
};

const poppins = Inter({subsets: ['latin'], variable: "--font-poppins"});

export default async function RootLayout({ children }) {

  const conn = await dbConnect();
  //console.log(conn)

  return (
    <html lang="en">
      <body
        className={cn(`${geistSans.variable} ${geistMono.variable} antialiased, poppins.className`) }
      >
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
