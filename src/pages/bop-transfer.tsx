import Head from "next/head";
import { BopTransferView } from "@/components/bop-transfer/bop-transfer-view";

export default function BopTransferPage() {
  return (
    <>
      <Head>
        <title>BOP Transfer - PRODSYNC Operations</title>
        <meta
          name="description"
          content="Transfer BOM-required bought-out parts (BOP) from Store Inventory into destination zones"
        />
      </Head>
      <BopTransferView />
    </>
  );
}
