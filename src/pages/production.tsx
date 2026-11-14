import Head from "next/head";
import { ProductionView } from "@/components/production/production-view";

export default function ProductionPage() {
  return (
    <>
      <Head>
        <title>Production Live Tracking - J Pan Tubular Enterprise Operations</title>
        <meta
          name="description"
          content="Live machine production progress, output achievement, NG count, and next process routing"
        />
      </Head>
      <ProductionView />
    </>
  );
}
