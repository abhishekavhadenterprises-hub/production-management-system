import Head from "next/head";
import { MachineSchedulerView } from "@/components/scheduler/machine-scheduler-view";

export default function MachineSchedulerPage() {
  return (
    <>
      <Head>
        <title>Machine Scheduler - J Pan Tubular Enterprise Operations</title>
        <meta
          name="description"
          content="Functional machine scheduling, work order queue, and capacity management workspace"
        />
      </Head>
      <MachineSchedulerView />
    </>
  );
}
