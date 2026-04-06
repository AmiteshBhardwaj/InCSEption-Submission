import { Activity, HeartPulse, ShieldCheck, Watch } from "lucide-react";
import { usePatientLabReports } from "../../../hooks/usePatientLabReports";
import LabReportsRequiredPlaceholder from "../../components/patient/LabReportsRequiredPlaceholder";
import PatientFeaturePlaceholder from "../../components/patient/PatientFeaturePlaceholder";
import { PatientPortalPage } from "../../components/patient/PortalTheme";

export default function Vitals() {
  const { hasLabReports, loading } = usePatientLabReports();

  if (loading) {
    return (
      <PatientPortalPage>
        <p className="text-sm text-[#A1A1AA]">Loading...</p>
      </PatientPortalPage>
    );
  }

  if (!hasLabReports) {
    return (
      <LabReportsRequiredPlaceholder
        title="Vitals"
        description="Wearable and lab-linked vitals after you upload reports"
      />
    );
  }

  return (
    <PatientFeaturePlaceholder
      eyebrow="Body Signals"
      title="Vitals"
      description="Track heart rate, blood pressure, and future wearable signals in the same premium dark workspace as the rest of your portal."
      icon={Activity}
      meta={[
        { label: "Wearables", value: "Not connected" },
        { label: "Lab-linked vitals", value: "Awaiting extraction" },
        { label: "Display mode", value: "Real data only" },
      ]}
      emptyTitle="No vitals to show yet"
      emptyDescription="You have lab files on file, but this portal only surfaces vitals once values are extracted from reports or synced from a wearable integration. No sample readings are displayed."
      highlights={[
        {
          label: "Heart and activity streams",
          value: "Heart rate, rhythm trends, and activity summaries appear after a verified device or report sync.",
          icon: HeartPulse,
          tone: "orange",
        },
        {
          label: "Device integrations",
          value: "Future wearable links will populate this area without mixing in fabricated numbers.",
          icon: Watch,
          tone: "purple",
        },
        {
          label: "Clinical reliability",
          value: "Every value shown here stays tied to your own uploads and linked monitoring sources.",
          icon: ShieldCheck,
          tone: "blue",
        },
      ]}
      supplementary={
        <p className="text-sm leading-7 text-[#D4D4D8]">
          Connect lab parsing or a device integration next to populate heart rate, blood pressure,
          and trend views from your real data.
        </p>
      }
    />
  );
}
