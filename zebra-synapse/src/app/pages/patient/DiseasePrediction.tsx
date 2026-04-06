import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Info, ShieldAlert, TrendingUp } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { usePatientLabReports } from "../../../hooks/usePatientLabReports";
import { usePatientLabPanels } from "../../../hooks/usePatientLabPanels";
import LabReportsRequiredPlaceholder from "../../components/patient/LabReportsRequiredPlaceholder";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import {
  PatientPageHero,
  PatientPortalPage,
  portalInsetClass,
  portalPanelClass,
} from "../../components/patient/PortalTheme";
import { formatDisplayDate } from "../../../lib/careRelationships";
import { formatLabDate, type LabPanelRow } from "../../../lib/labPanels";
import { getDiseasePredictions, getLatestLabPanel } from "../../../lib/labInsights";
import { getSupabase } from "../../../lib/supabase";

type PatientPredictionFallbackRow = {
  last_visit: string | null;
  primary_condition: string | null;
  glucose: number | null;
  health_status: "normal" | "elevated" | "risk";
  risk_flags: string[] | null;
  created_at: string;
};

function levelBadgeClass(level: "low" | "moderate" | "high") {
  if (level === "low") return "border border-green-500/20 bg-green-500/20 text-green-400";
  if (level === "moderate") return "border border-yellow-500/20 bg-yellow-500/20 text-yellow-400";
  return "border border-red-500/20 bg-red-500/20 text-red-400";
}

export default function DiseasePrediction() {
  const { user } = useAuth();
  const { hasLabReports, loading } = usePatientLabReports();
  const { panels, loading: panelsLoading, hasPanels } = usePatientLabPanels();
  const [careRow, setCareRow] = useState<PatientPredictionFallbackRow | null>(null);
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

    setCareRow((data as PatientPredictionFallbackRow | null) ?? null);
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
      id: "care-derived-panel",
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
  const predictions = derivedPanel ? getDiseasePredictions(derivedPanel) : [];
  const hasPredictionSource = Boolean(derivedPanel);
  const panelDateLabel = derivedPanel
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

  if (!hasLabReports && !hasPredictionSource) {
    return (
      <LabReportsRequiredPlaceholder
        title="Disease Prediction"
        description="Risk assessments based on your lab-derived data"
      />
    );
  }

  if (!hasPredictionSource) {
    return (
      <PatientPortalPage>
        <PatientPageHero
          eyebrow="Predictive Intelligence"
          title="Disease Prediction"
          description="Review future risk assessments in a dark analytical workspace designed to keep predictive insights readable, focused, and grounded in verified data."
          icon={TrendingUp}
          meta={[
            { label: "Risk models", value: "Standby" },
            { label: "Source data", value: "Awaiting prediction inputs" },
            { label: "Clinical posture", value: "Decision support only" },
          ]}
        />

        {loadError ? (
          <section className={`${portalPanelClass} border-red-500/20 bg-red-500/[0.08] p-6`}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/12">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Could not load prediction inputs</h2>
                <p className="mt-2 text-sm leading-7 text-red-100/85">{loadError}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className={`${portalPanelClass} border-[#3B82F6]/15 bg-[#3B82F6]/[0.08] p-6`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/12">
              <Info className="h-5 w-5 text-[#93c5fd]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Not a diagnosis</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[#c7ddff]">
                Predictions appear once the portal has enough real glucose, lipid, kidney, or blood
                markers from your uploads or linked clinician records. Demo risk cards are never shown here.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className={portalPanelClass}>
            <CardHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <TrendingUp className="h-5 w-5 text-[#ff9c61]" />
              </div>
              <CardTitle className="text-white">No risk models to display yet</CardTitle>
              <CardDescription className="text-white/60">
                Your portal has not received enough structured biomarker inputs to produce rule-based
                predictions yet. Once glucose, lipid, kidney, or hemoglobin values are available, this
                view will populate automatically.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">What unlocks this section</CardTitle>
              <CardDescription className="text-white/60">
                Predictions require structured values from your uploaded records before the app can
                generate meaningful rule-based signals.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                {
                  label: "Model input quality",
                  value: "Predictions wait until biomarkers are structured clearly enough for reliable interpretation.",
                  icon: ShieldAlert,
                  tone: "text-[#93c5fd]",
                },
                {
                  label: "Risk presentation",
                  value: "Future score cards emphasize severity bands and clinician review instead of flat percentages alone.",
                  icon: AlertTriangle,
                  tone: "text-[#ffe09d]",
                },
                {
                  label: "False certainty avoided",
                  value: "This portal avoids showing sample diabetes or cardiovascular scores that are not tied to your results.",
                  icon: TrendingUp,
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
        eyebrow="Predictive Intelligence"
        title="Disease Prediction"
        description="Rule-based risk assessments generated from your latest structured lab results."
        icon={TrendingUp}
        meta={[
            { label: "Predictions", value: predictions.length },
          { label: "Latest Source", value: panelDateLabel },
          { label: "Input stream", value: latestPanel ? "Structured lab panel" : "Linked care data" },
          { label: "Clinical posture", value: "Decision support only" },
        ]}
      />

      {loadError ? (
        <section className={`${portalPanelClass} border-red-500/20 bg-red-500/[0.08] p-6`}>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/12">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Some prediction inputs could not load</h2>
              <p className="mt-2 text-sm leading-7 text-red-100/85">{loadError}</p>
            </div>
          </div>
        </section>
      ) : null}

      <section className={`${portalPanelClass} border-[#3B82F6]/15 bg-[#3B82F6]/[0.08] p-6`}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3B82F6]/20 bg-[#3B82F6]/12">
            <Info className="h-5 w-5 text-[#93c5fd]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Not a diagnosis</h2>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[#c7ddff]">
              These rule-based predictions help summarize patterns in your current lab panel, but they
              do not replace evaluation by a clinician.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {predictions.map((prediction) => (
            <Card key={prediction.title} className={portalPanelClass}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-white">{prediction.title}</CardTitle>
                    <CardDescription className="mt-2 text-white/60">{prediction.rationale}</CardDescription>
                  </div>
                  <Badge className={levelBadgeClass(prediction.level)}>
                    {prediction.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`${portalInsetClass} p-4`}>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Why it appeared</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">{prediction.rationale}</p>
                </div>
                <div className={`${portalInsetClass} p-4`}>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Suggested next step</p>
                  <p className="mt-2 text-sm leading-7 text-white/80">{prediction.nextStep}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">Prediction context</CardTitle>
              <CardDescription className="text-white/60">
                These signals are generated from your most recent structured lab panel.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`${portalInsetClass} p-4`}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Panel Date</p>
                <p className="mt-2 text-sm font-medium text-white">{panelDateLabel}</p>
              </div>
              <div className={`${portalInsetClass} p-4`}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Prediction Source</p>
                <p className="mt-2 text-sm font-medium text-white">
                  {latestPanel ? "Structured lab panel" : "Linked clinician record"}
                </p>
              </div>
              <div className={`${portalInsetClass} p-4`}>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Usage</p>
                <p className="mt-2 text-sm font-medium text-white">
                  Use these cards as conversation starters with your care team.
                </p>
              </div>
              {careRow?.risk_flags?.length ? (
                <div className={`${portalInsetClass} p-4`}>
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">Linked Risk Flags</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {careRow.risk_flags.map((flag) => (
                      <Badge
                        key={flag}
                        variant="outline"
                        className="border-white/10 bg-white/[0.04] px-3 py-1 text-white/80"
                      >
                        {flag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className={portalPanelClass}>
            <CardHeader>
              <CardTitle className="text-white">Prediction tags</CardTitle>
              <CardDescription className="text-white/60">
                Quick labels for the current risk patterns detected in your latest panel.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {predictions.map((prediction) => (
                <Badge
                  key={prediction.title}
                  variant="outline"
                  className="border-white/10 bg-white/[0.04] px-3 py-1 text-white/80"
                >
                  {prediction.title}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PatientPortalPage>
  );
}
