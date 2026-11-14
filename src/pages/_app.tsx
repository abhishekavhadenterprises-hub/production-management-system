import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

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
      <div className="font-sans min-h-screen">
        <DashboardLayout>
          <Component {...pageProps} />
        </DashboardLayout>
      </div>
    </>
  );
}
