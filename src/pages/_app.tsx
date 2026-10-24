import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Inter } from "next/font/google";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Overview - J Pan Tubular Enterprise Operations</title>
        <meta
          name="description"
          content="Production Management System"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`${inter.variable} ${inter.className} font-sans min-h-screen`}>
        <DashboardLayout>
          <Component {...pageProps} />
        </DashboardLayout>
      </div>
    </>
  );
}
