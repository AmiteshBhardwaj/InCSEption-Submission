import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, ExternalLink, FlaskConical, Microscope, SearchCheck } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { usePatientLabReports } from "../../../hooks/usePatientLabReports";
import { usePatientLabPanels } from "../../../hooks/usePatientLabPanels";
import { formatDisplayDate } from "../../../lib/careRelationships";
import { getLatestLabPanel, getTrialMatches } from "../../../lib/labInsights";
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

type PatientTrialsFallbackRow = {
  last_visit: string | null;
  primary_condition: string | null;
  glucose: number | null;
  health_status: "normal" | "elevated" | "risk";
  risk_flags: string[] | null;
  created_at: string;
};

function statusBadgeClass(status: PatientTrialsFallbackRow["health_status"]) {
  if (status === "normal") return "border border-green-500/20 bg-green-500/20 text-green-400";
  if (status === "elevated") return "border border-yellow-500/20 bg-yellow-500/20 text-yellow-400";
  return "border border-red-500/20 bg-red-500/20 text-red-400";
}

export default function ClinicalTrials() {
  const { user } = useAuth();
  const { hasLabReports, loading } = usePatientLabReports();
  const { panels, loading: panelsLoading } = usePatientLabPanels();
  const [careRow, setCareRow] = useState<PatientTrialsFallbackRow | null>(null);
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

    setCareRow((data as PatientTrialsFallbackRow | null) ?? null);
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
      id: "care-derived-trials-panel",
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
  const trialMatches = derivedPanel ? getTrialMatches(derivedPanel) : [];
  const hasTrialSource = Boolean(derivedPanel);
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

  if (!hasLabReports && !hasTrialSource) {
    return (
      <LabReportsRequiredPlaceholder
        title="Clinical Trials"
        description="Trial matching based on conditions inferred from your labs"
      />
    );
  }

  if (!hasTrialSource) {
    return (
      <PatientPortalPage>
        <PatientPageHero
          eyebrow="Research Matching"
          title="Clinical Trials"
          description="Explore study matches in a focused dark workspace that keeps eligibility signals readable and tied to your own record."
          icon={FlaskConical}
          meta={[
            { label: "Matched studies", value: "0" },
            { label: "Eligibility engine", value: "Awaiting trial inputs" },
            { label: "Search scope", value: "Patient-specific only" },
          ]}
        />

        {loadError ? (
          <section className={`${portalPanelClass} border-red-500/20 bg-red-500/[0.08] p-6`}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/12">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Could not load trial inputs</h2>
                <p className="mt-2 text-sm leading-7 text-red-100/85">{loadError}</p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className={portalPanelClass}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <FlaskConical className="h-5 w-5 text-[#ff9c61]" />
              </div>
              <CardTitle className="text-white">No trial matches yet</CardTitle>
              <CardDescription className="text-white/60">
                Matching appears once the portal has enough real biomarker or linked clinical context to form eligibility search categories.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">What unlocks this section</CardTitle>
              <CardDescription className="text-white/60">
                The app uses your own clinical markers to derive search themes instead of dumping generic public studies into the portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: "Eligibility matching",
                  value: "Condition markers, lab thresholds, and profile details narrow the study themes once records are structured.",
                  icon: SearchCheck,
                  tone: "text-[#ff9c61]",
                },
                {
                  label: "Study relevance",
                  value: "This prevents the portal from surfacing generic cardiometabolic studies that may not fit your case.",
                  icon: Microscope,
                  tone: "text-[#b4abff]",
                },
                {
                  label: "External research search",
                  value: "You can still browse ClinicalTrials.gov directly with your care team while this section waits for enough data.",
                  icon: FlaskConical,
                  tone: "text-[#93c5fd]",
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
        eyebrow="Research Matching"
        title="Clinical Trials"
        description="Trial search themes generated from your latest real biomarker and linked care signals."
        icon={FlaskConical}
        meta={[
          { label: "Matched studies", value: trialMatches.length },
          { label: "Eligibility engine", value: sourceLabel },
          { label: "Recorded", value: recordedLabel },
          { label: "Search scope", value: "Patient-specific only" },
        ]}
      />

      {loadError ? (
        <section className={`${portalPanelClass} border-red-500/20 bg-red-500/[0.08] p-6`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/12">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Some trial inputs could not load</h2>
              <p className="mt-2 text-sm leading-7 text-red-100/85">{loadError}</p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {trialMatches.map((trial) => (
            <Card key={trial.title} className={portalPanelClass}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-white">{trial.title}</CardTitle>
                    <CardDescription className="mt-2 text-white/60">{trial.summary}</CardDescription>
                  </div>
                  {careRow ? (
                    <Badge className={statusBadgeClass(careRow.health_status)}>{careRow.health_status}</Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`${portalInsetClass} p-4`}>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Suggested search query</p>
                  <p className="mt-2 text-sm font-medium text-white">{trial.query}</p>
                </div>
                <div className={`${portalInsetClass} p-4`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">How to use it</p>
                      <p className="mt-2 text-sm leading-7 text-white/80">
                        Use this category with your care team to review current eligibility, exclusions, and study location.
                      </p>
                    </div>
                    <a
                      href={`https://clinicaltrials.gov/search?term=${encodeURIComponent(trial.query)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    >
                      Search
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">Match context</CardTitle>
              <CardDescription className="text-white/60">
                These categories are derived from your most recent structured health signals.
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
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Matching posture</p>
                <p className="mt-2 text-sm font-medium text-white">
                  Search themes only. Formal eligibility still depends on study criteria and clinician review.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">Search tags</CardTitle>
              <CardDescription className="text-white/60">
                Quick labels for the trial categories detected from your latest data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {trialMatches.map((trial) => (
                <Badge
                  key={trial.title}
                  variant="outline"
                  className="border-white/10 bg-white/[0.04] px-3 py-1 text-white/80"
                >
                  {trial.title}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientPortalPage>
  );
}
