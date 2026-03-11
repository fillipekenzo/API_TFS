import type { Metadata } from "next";
import {  Roboto } from "next/font/google";
import "./globals.css";
import "../app/styles/_base.scss";
import "../app/styles/globals.scss";
import "../app/styles/antd-styles.scss";
import Head from "next/head";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TFS API",
  description: "Api para cadastrar Task no TFS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <Head>
        <meta httpEquiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta
          httpEquiv="Content-Type"
          content="Application/json; charset=UTF-8"
        />
        <title>TFS API</title>
        <meta name="TFS API" content="TFS API" />
        <link rel="manifest" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body
        className={`${roboto.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
