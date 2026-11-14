import Head from "next/head";
import { BrazingView } from "@/components/brazing/brazing-view";

export default function BrazingPage() {
  return (
    <>
      <Head>
        <title>Brazing Zone - PRODSYNC Scheduler v2</title>
        <meta
          name="description"
          content="Continuous brazing line dispatch, queue management, OK/NG metrics, and next handoff inspection"
        />
      </Head>
      <BrazingView />
    </>
  );
}
