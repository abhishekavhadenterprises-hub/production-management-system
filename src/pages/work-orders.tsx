import Head from "next/head";
import { WorkOrdersView } from "@/components/work-orders/work-orders-view";

export default function WorkOrdersPage() {
  return (
    <>
      <Head>
        <title>Work Orders Management - PRODSYNC Enterprise</title>
        <meta
          name="description"
          content="SoftGen ERP Work Order Management, BOM inspection, and schedule integration"
        />
      </Head>
      <WorkOrdersView />
    </>
  );
}
