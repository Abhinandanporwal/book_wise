import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/header";


export const metadata: Metadata = {
  title: "BookWise",
  description: "An AI driven library assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" >
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
