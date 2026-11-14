import Head from "next/head";
import { WorkOrderAssignmentView } from "@/components/work-order-assignment/work-order-assignment-view";

export default function WorkOrderAssignmentPage() {
  return (
    <>
      <Head>
        <title>Work Order Assignment - PRODSYNC Operations</title>
        <meta
          name="description"
          content="Multi-stage component allocation for Machine, Brazing, Leak Testing, Packing, and FG Zones"
        />
      </Head>
      <WorkOrderAssignmentView />
    </>
  );
}
