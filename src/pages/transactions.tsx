import Head from "next/head";
import { TransactionFormsHubView } from "@/components/transactions/transaction-forms-hub-view";

export default function TransactionsPage() {
  return (
    <>
      <Head>
        <title>ERP Transaction Forms Hub - PRODSYNC Operations</title>
        <meta
          name="description"
          content="Central directory for all operational entry forms, shop-floor logs, quality audits, and stock movement transactions"
        />
      </Head>
      <TransactionFormsHubView />
    </>
  );
}
