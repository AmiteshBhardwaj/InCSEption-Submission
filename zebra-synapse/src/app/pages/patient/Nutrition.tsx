import { Apple, Leaf, ShieldCheck, Utensils } from "lucide-react";
import { usePatientLabReports } from "../../../hooks/usePatientLabReports";
import LabReportsRequiredPlaceholder from "../../components/patient/LabReportsRequiredPlaceholder";
import PatientFeaturePlaceholder from "../../components/patient/PatientFeaturePlaceholder";
import { PatientPortalPage } from "../../components/patient/PortalTheme";

export default function Nutrition() {
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
        title="Nutrition Plan"
        description="Meal plans and macros based on your lab data"
      />
    );
  }

  return (
    <PatientFeaturePlaceholder
      eyebrow="Nutrition Intelligence"
      title="Nutrition Plan"
      description="View food guidance, meal priorities, and macro suggestions in a dark planning workspace that stays tied to your real clinical markers."
      icon={Apple}
      meta={[
        { label: "Meal plans", value: "Awaiting biomarkers" },
        { label: "Macro guidance", value: "Not generated" },
        { label: "Personalization", value: "Lab-driven only" },
      ]}
      emptyTitle="No nutrition plan yet"
      emptyDescription="You have lab files on file, but no structured lab values are available to drive calories, macros, or meal suggestions. Those will appear here after your reports are processed."
      highlights={[
        {
          label: "Meal planning",
          value: "Balanced meal structure and macro targets will populate when your biomarker profile is available.",
          icon: Utensils,
          tone: "orange",
        },
        {
          label: "Food quality",
          value: "Recommendations can emphasize fiber, protein, hydration, and recovery without reverting to generic sample plans.",
          icon: Leaf,
          tone: "purple",
        },
        {
          label: "Clinical grounding",
          value: "Nothing shown here is treated as medical advice unless it is tied back to your own extracted results.",
          icon: ShieldCheck,
          tone: "blue",
        },
      ]}
    />
  );
}
