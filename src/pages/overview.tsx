import Head from "next/head";
import { OverviewView } from "@/components/overview/overview-view";

export default function OverviewPage() {
  return (
    <>
      <Head>
        <title>Dashboard Zone - J Pan Tubular Enterprise Operations</title>
        <meta
          name="description"
          content="Zonewise Real-Time Virtual Box Inventory, Process Throughput & Assembly Traceability"
        />
      </Head>
      <OverviewView />
    </>
  );
}
