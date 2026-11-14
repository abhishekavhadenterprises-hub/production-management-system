import Head from "next/head";
import { SplitCancelZoneView } from "@/components/split-cancel/split-cancel-zone-view";

export default function SplitCancelZonePage() {
  return (
    <>
      <Head>
        <title>Split / Cancel Work Order Zone - PRODSYNC Operations</title>
        <meta
          name="description"
          content="Comprehensive overview, reasons, parent-child lineage, and timeline of all Cancelled and Split work orders"
        />
      </Head>
      <SplitCancelZoneView />
    </>
  );
}
