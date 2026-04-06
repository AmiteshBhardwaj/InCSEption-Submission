import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, HeartHandshake, MoonStar, Sparkles, Waves } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { usePatientLabReports } from "../../../hooks/usePatientLabReports";
import { usePatientLabPanels } from "../../../hooks/usePatientLabPanels";
import { formatDisplayDate } from "../../../lib/careRelationships";
import { getLatestLabPanel, getWellnessTips } from "../../../lib/labInsights";
import { formatLabDate, type LabPanelRow } from "../../../lib/labPanels";
import { getSupabase } from "../../../lib/supabase";
import LabReportsRequiredPlaceholder from "../../components/patient/LabReportsRequiredPlaceholder";
import {
  PatientPageHero,
  PatientPortalPage,
  portalInsetClass,
  portalPanelClass,
} from "../../components/patient/PortalTheme";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";

type PatientWellnessFallbackRow = {
  last_visit: string | null;
  primary_condition: string | null;
  glucose: number | null;
  health_status: "normal" | "elevated" | "risk";
  risk_flags: string[] | null;
  created_at: string;
};

function toneBadgeClass(status: PatientWellnessFallbackRow["health_status"]) {
  if (status === "normal") return "border border-green-500/20 bg-green-500/20 text-green-400";
  if (status === "elevated") return "border border-yellow-500/20 bg-yellow-500/20 text-yellow-400";
  return "border border-red-500/20 bg-red-500/20 text-red-400";
}

function toneLabel(status: PatientWellnessFallbackRow["health_status"]) {
  if (status === "normal") return "Stable";
  if (status === "elevated") return "Watch trends";
  return "Needs support";
}

export default function WellnessTips() {
  const { user } = useAuth();
  const { hasLabReports, loading } = usePatientLabReports();
  const { panels, loading: panelsLoading, hasPanels } = usePatientLabPanels();
  const [careRow, setCareRow] = useState<PatientWellnessFallbackRow | null>(null);
  const [careLoading, setCareLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadCareRow = useCallback(async () => {
    const sb = getSupabase();
    const patientId = user?.id;

    if (!sb || !patientId) {
      setCareRow(null);
      setCareLoading(false);
      return;
    }

    setCareLoading(true);
    setLoadError(null);

    const { data, error } = await sb
      .from("care_relationships")
      .select("last_visit, primary_condition, glucose, health_status, risk_flags, created_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setLoadError(error.message);
      setCareRow(null);
      setCareLoading(false);
      return;
    }

    setCareRow((data as PatientWellnessFallbackRow | null) ?? null);
    setCareLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void loadCareRow();
  }, [loadCareRow]);

  const latestPanel = getLatestLabPanel(panels);
  const derivedPanel = useMemo<LabPanelRow | null>(() => {
    if (latestPanel) return latestPanel;
    if (!careRow || careRow.glucose == null) return null;

    return {
      id: "care-derived-wellness-panel",
      patient_id: user?.id ?? "patient",
      upload_id: null,
      recorded_at: careRow.last_visit ?? careRow.created_at,
      biomarkers: { fasting_glucose: careRow.glucose },
      hemoglobin_a1c: null,
      fasting_glucose: careRow.glucose,
      total_cholesterol: null,
      ldl: null,
      hdl: null,
      triglycerides: null,
      hemoglobin: null,
      wbc: null,
      platelets: null,
      creatinine: null,
      notes: careRow.primary_condition ?? null,
      created_at: careRow.created_at,
    };
  }, [careRow, latestPanel, user?.id]);
  const tips = derivedPanel ? getWellnessTips(derivedPanel) : [];
  const hasTipSource = Boolean(derivedPanel);
  const sourceLabel = latestPanel ? "Structured lab panel" : "Linked care data";
  const recordedLabel = derivedPanel
    ? latestPanel
      ? formatLabDate(derivedPanel.recorded_at)
      : formatDisplayDate(derivedPanel.recorded_at)
    : "Awaiting data";

  if (loading || panelsLoading || careLoading) {
    return (
      <PatientPortalPage>
        <p className="text-sm text-[#A1A1AA]">Loading...</p>
      </PatientPortalPage>
    );
  }

  if (!hasLabReports && !hasTipSource) {
    return (
      <LabReportsRequiredPlaceholder
        title="Wellness Tips"
        description="Tips grounded in your lab results and vitals"
      />
    );
  }

  if (!hasTipSource) {
    return (
      <PatientPortalPage>
        <PatientPageHero
          eyebrow="Lifestyle Guidance"
          title="Wellness Tips"
          description="Surface recovery, sleep, movement, and habit guidance in the same premium dark workspace used across the rest of the portal."
          icon={Sparkles}
          meta={[
            { label: "Tip categories", value: "Pending" },
            { label: "Signals", value: "Awaiting wellness inputs" },
            { label: "Tone", value: "Personalized only" },
          ]}
        />

        {loadError ? (
          <section className={`${portalPanelClass} border-red-500/20 bg-red-500/[0.08] p-6`}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/12">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Could not load wellness inputs</h2>
                <p className="mt-2 text-sm leading-7 text-red-100/85">{loadError}</p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className={portalPanelClass}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Sparkles className="h-5 w-5 text-[#ff9c61]" />
              </div>
              <CardTitle className="text-white">No personalized tips yet</CardTitle>
              <CardDescription className="text-white/60">
                Wellness guidance appears after the portal can read enough real glucose, lipid,
                kidney, or blood markers from your records.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">What unlocks this section</CardTitle>
              <CardDescription className="text-white/60">
                Tips stay tied to your own biomarkers and linked care signals instead of generic lifestyle copy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: "Sleep and recovery",
                  value: "Sleep quality prompts and recovery guidance appear when your trends indicate a useful focus area.",
                  icon: MoonStar,
                  tone: "text-[#b4abff]",
                },
                {
                  label: "Movement and energy",
                  value: "Activity advice stays linked to your own markers instead of broad one-size-fits-all coaching.",
                  icon: Waves,
                  tone: "text-[#93c5fd]",
                },
                {
                  label: "Care alignment",
                  value: "Tips are designed to support your clinician guidance, not replace it.",
                  icon: HeartHandshake,
                  tone: "text-[#ff9c61]",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`${portalInsetClass} p-4`}>
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                        <Icon className={`h-4 w-4 ${item.tone}`} />
                      </span>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-white/75">{item.value}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </PatientPortalPage>
    );
  }

  return (
    <PatientPortalPage>
      <PatientPageHero
        eyebrow="Lifestyle Guidance"
        title="Wellness Tips"
        description="Personalized habit and recovery guidance generated from your most recent real health signals."
        icon={Sparkles}
        meta={[
          { label: "Tip categories", value: tips.length },
          { label: "Signals", value: sourceLabel },
          { label: "Recorded", value: recordedLabel },
          { label: "Tone", value: careRow ? toneLabel(careRow.health_status) : "Personalized" },
        ]}
      />

      {loadError ? (
        <section className={`${portalPanelClass} border-red-500/20 bg-red-500/[0.08] p-6`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/12">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Some wellness inputs could not load</h2>
              <p className="mt-2 text-sm leading-7 text-red-100/85">{loadError}</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {tips.map((tip) => (
            <Card key={tip.title} className={portalPanelClass}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                    <Sparkles className="h-5 w-5 text-[#ff9c61]" />
                  </span>
                  <div>
                    <CardTitle className="text-white">{tip.title}</CardTitle>
                    <CardDescription className="mt-2 text-white/60">{tip.detail}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`${portalInsetClass} p-4`}>
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                      <Activity className="h-4 w-4 text-[#93c5fd]" />
                    </span>
                    <p className="text-sm leading-7 text-white/80">
                      Keep this tip in context with your current symptoms, recovery, and clinician plan.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">Tip context</CardTitle>
              <CardDescription className="text-white/60">
                Guidance is generated from your latest structured signal source.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`${portalInsetClass} p-4`}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Source</p>
                <p className="mt-2 text-sm font-medium text-white">{sourceLabel}</p>
              </div>
              <div className={`${portalInsetClass} p-4`}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Recorded</p>
                <p className="mt-2 text-sm font-medium text-white">{recordedLabel}</p>
              </div>
              <div className={`${portalInsetClass} p-4`}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Focus</p>
                <p className="mt-2 text-sm font-medium text-white">
                  Tips adapt to glucose, lipid, kidney, and energy-related markers when available.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">Wellness tags</CardTitle>
              <CardDescription className="text-white/60">
                Quick summary of the themes highlighted by your current signals.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {tips.map((tip) => (
                <Badge
                  key={tip.title}
                  variant="outline"
                  className="border-white/10 bg-white/[0.04] px-3 py-1 text-white/80"
                >
                  {tip.title}
                </Badge>
              ))}
              {careRow ? (
                <Badge className={toneBadgeClass(careRow.health_status)}>{toneLabel(careRow.health_status)}</Badge>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientPortalPage>
  );
}
