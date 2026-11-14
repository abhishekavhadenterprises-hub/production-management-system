import Head from "next/head";
import { MasterDataHubView } from "@/components/masters/master-data-hub-view";

export default function MastersIndexPage() {
  return (
    <>
      <Head>
        <title>Master Data Configuration - PRODSYNC Operations</title>
        <meta
          name="description"
          content="Select a module to manage its master data and schema configurations"
        />
      </Head>
      <MasterDataHubView />
    </>
  );
}
