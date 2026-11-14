import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { ArrowLeft } from "lucide-react";
import { BomMasterView } from "@/components/masters/bom-master-view";
import { ZoneMasterView } from "@/components/masters/zone-master-view";
import { DepartmentMasterView } from "@/components/masters/department-master-view";
import { SectionMasterView } from "@/components/masters/section-master-view";
import { EmployeeMasterView } from "@/components/masters/employee-master-view";
import { MachineMasterView } from "@/components/masters/machine-master-view";
import { ToolMasterView } from "@/components/masters/tool-master-view";
import { DelayReasonsView } from "@/components/masters/delay-reasons-view";
import { CancelSplitReasonsView } from "@/components/masters/cancel-split-reasons-view";
import { VirtualBoxMasterView } from "@/components/masters/virtual-box-master-view";
import { AssemblyRouteCardView } from "@/components/masters/assembly-route-card-view";
import { InventoryStockView } from "@/components/masters/inventory-stock-view";
import { GenericMasterView } from "@/components/masters/generic-master-view";

const MASTER_TITLES: Record<string, string> = {
  "bom-master-assembly": "BOM Master (Assembly)",
  "bom": "BOM Master (Assembly)",
  "zone-master": "Zone Master",
  "department-master": "Department Master",
  "section-master": "Section Master",
  "employee-master": "Employee Master",
  "machines": "Machine Master",
  "tool-master": "Tool Master",
  "delay-reasons": "Delay Reasons Master",
  "cancel-split-reasons": "Cancel & Split Reasons Master",
  "virtual-box-master": "Virtual Box Master (VB1-VB4)",
  "assembly-route-card": "Assembly Route Card Master",
  "inventory-stock": "Inventory & Stock Master",
};

export default function MasterDynamicPage() {
  const router = useRouter();
  const { masterId } = router.query;

  if (!masterId || typeof masterId !== "string") {
    return <BomMasterView />;
  }

  const pageTitle = MASTER_TITLES[masterId] || "Master Data Hub";

  const renderContent = () => {
    switch (masterId) {
      case "bom-master-assembly":
      case "bom":
        return <BomMasterView />;
      case "zone-master":
        return <ZoneMasterView />;
      case "department-master":
        return <DepartmentMasterView />;
      case "section-master":
        return <SectionMasterView />;
      case "employee-master":
        return <EmployeeMasterView />;
      case "machines":
      case "machine-master":
        return <MachineMasterView />;
      case "tool-master":
        return <ToolMasterView />;
      case "delay-reasons":
        return <DelayReasonsView />;
      case "cancel-split-reasons":
        return <CancelSplitReasonsView />;
      case "virtual-box-master":
        return <VirtualBoxMasterView />;
      case "assembly-route-card":
        return <AssemblyRouteCardView />;
      case "inventory-stock":
      case "stock":
        return <InventoryStockView />;
      default:
        return <GenericMasterView masterId={masterId} />;
    }
  };

  return (
    <>
      <Head>
        <title>{pageTitle} - J Pan Tubular Enterprise Operations</title>
      </Head>
      <div>
        {/* Navigation Breadcrumb back to Master Hub */}
        <div className="bg-white border-b border-[#E5E5EA] px-6 sm:px-8 py-2.5 flex items-center justify-between text-xs">
          <Link
            href="/masters"
            className="inline-flex items-center gap-1.5 text-[#007AFF] hover:text-[#0062CC] font-semibold transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Master Data Hub</span>
          </Link>
          <span className="text-[11px] text-[#86868B] font-medium hidden sm:inline">
            System Masters &bull; {pageTitle}
          </span>
        </div>

        {renderContent()}
      </div>
    </>
  );
}
