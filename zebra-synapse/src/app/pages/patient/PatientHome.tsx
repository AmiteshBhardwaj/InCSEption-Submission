import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/alert";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  CheckCircle,
  FlaskConical,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { usePatientLabReports } from "../../../hooks/usePatientLabReports";
import { usePatientLabPanels } from "../../../hooks/usePatientLabPanels";
import { formatLabDate } from "../../../lib/labPanels";
import {
  MetricPriorityBars,
  MetricSparklineGrid,
  MetricStatusDonut,
  OverviewStatCards,
} from "../../components/patient/InsightVisuals";
import {
  getMetricAssessments,
  getLatestLabPanel,
  getMetricsForDashboard,
  getMetricValueLabel,
  getOverallStatus,
} from "../../../lib/labInsights";

export default function PatientHome() {
  const { hasLabReports, loading, uploads, uploadLabReport } = usePatientLabReports();
  const { panels, loading: panelsLoading, hasPanels, refetch: refetchPanels } =
    usePatientLabPanels();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const latestPanel = useMemo(() => getLatestLabPanel(panels), [panels]);
  const overall = latestPanel ? getOverallStatus(latestPanel) : null;
  const allMetrics = useMemo(
    () =>
      latestPanel
        ? getMetricAssessments(latestPanel).filter((metric) => metric.status !== "missing")
        : [],
    [latestPanel],
  );
  const topMetrics = latestPanel ? getMetricsForDashboard(latestPanel, 20) : [];
  const recentUploads = uploads.slice(0, 4);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    setSubmitting(true);
    try {
      const result = await uploadLabReport(selectedFile);
      await refetchPanels();
      toast.success(
        result.extracted
          ? result.message ?? "Lab report uploaded and biomarkers extracted."
          : "Lab report uploaded.",
      );
      if (!result.extracted && result.message) {
        toast(result.message);
      }
      setSelectedFile(null);
      const input = document.getElementById("lab-upload") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(98,70,255,0.18),_transparent_26%),linear-gradient(180deg,#121216_0%,#09090c_100%)] px-6 py-8 text-white md:px-8 xl:px-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#121215]/95 px-6 py-7 shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:px-8">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(255,140,72,0.22)_0%,_rgba(255,140,72,0)_72%)] blur-2xl" />
            <div className="absolute right-8 top-6 h-80 w-36 rotate-[24deg] rounded-full border border-[#ff9e67]/40 opacity-70" />
            <div className="absolute right-20 top-2 h-80 w-36 rotate-[24deg] rounded-full border border-[#8d74ff]/30 opacity-45" />
            <div className="absolute right-14 top-0 h-80 w-36 rotate-[24deg]">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-[#ff8c48]/80 to-transparent" />
              <div className="absolute top-8 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="absolute top-28 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="absolute top-48 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
              <div className="absolute top-68 h-px w-full bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#f57c33]/30 bg-[#f57c33]/12 px-3 py-1 text-xs uppercase tracking-[0.24em] text-[#ffb07a]">
                  Patient Portal
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-white/60">
                  Structured Health Overview
                </span>
              </div>

              <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white md:text-5xl">
                Health Diagnosis Overview
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-7 text-white/68 md:text-base">
                {hasPanels
                  ? "Your latest structured lab results are now driving the analysis across the portal."
                  : hasLabReports
                    ? "Your report files are saved. If extraction missed anything, add values from the report below."
                    : "Upload a lab report to unlock medical records, vitals summaries, and personalized insights."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">Portal status</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {hasPanels ? "Analysis active" : hasLabReports ? "Files stored" : "Awaiting upload"}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/40">Latest panel</p>
                  <p className="mt-2 text-sm font-medium text-white">
                    {latestPanel ? formatLabDate(latestPanel.recorded_at) : "No panel yet"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3 xl:w-[30rem] xl:grid-cols-1">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Summary</p>
                  <Activity className="h-4 w-4 text-[#ff9d66]" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <div className="rounded-[1.3rem] bg-gradient-to-br from-[#fb7b34] to-[#f25e2b] p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/75">Tracked biomarkers</p>
                    <p className="mt-3 text-3xl font-semibold">
                      {latestPanel ? Object.keys(latestPanel.biomarkers ?? {}).length : 0}
                    </p>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/10 bg-[#1b1b21] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-white/42">Review focus</p>
                    <p className="mt-3 text-lg font-medium text-white">
                      {overall?.label ?? "Pending upload"}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/55">
                      {overall?.summary ?? "Add your first report to activate visual analysis."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5 md:col-span-2 xl:col-span-1">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Portal signals</p>
                  <Sparkles className="h-4 w-4 text-[#8f7cff]" />
                </div>
                <div className="space-y-3">
                  {[
                    {
                      icon: ShieldCheck,
                      label: "Secure storage",
                      value: hasLabReports ? "Reports saved" : "Waiting for first upload",
                    },
                    {
                      icon: FlaskConical,
                      label: "Extraction",
                      value: hasPanels ? "Biomarkers processed" : "No extracted panel yet",
                    },
                    {
                      icon: ArrowUpRight,
                      label: "Recent files",
                      value: `${uploads.length} file${uploads.length === 1 ? "" : "s"} in portal`,
                    },
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                            <Icon className="h-4 w-4 text-[#ff9d66]" />
                          </span>
                          <span className="text-sm text-white/72">{item.label}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {latestPanel ? (
          <div className="space-y-6">
            <OverviewStatCards
              stats={[
                {
                  label: "Tracked Biomarkers",
                  value: Object.keys(latestPanel.biomarkers ?? {}).length,
                  detail: "Live markers extracted from your latest uploaded report.",
                  tone: "orange",
                },
                {
                  label: "Outside Range",
                  value: allMetrics.filter((metric) => metric.status === "high" || metric.status === "low").length,
                  detail: "Markers that need the fastest follow-up.",
                  tone: "rose",
                },
                {
                  label: "Borderline",
                  value: allMetrics.filter((metric) => metric.status === "borderline").length,
                  detail: "Markers worth tracking before they drift further.",
                  tone: "violet",
                },
                {
                  label: "Uploaded Reports",
                  value: uploads.length,
                  detail: "Files currently powering your patient portal.",
                  tone: "slate",
                },
              ]}
            />

            <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <MetricPriorityBars
                metrics={allMetrics}
                title="Highest-priority markers"
                description="The dashboard ranks urgent markers first so follow-up is easier to scan."
                limit={10}
              />
              <MetricStatusDonut
                metrics={allMetrics}
                title="Biomarker status mix"
                description="A quick read on how the latest panel is distributed across normal, borderline, and outside-range markers."
              />
            </div>

            <MetricSparklineGrid
              panels={panels}
              metricKeys={topMetrics.slice(0, 6).map((metric) => metric.key)}
              title="Recent marker movement"
              description="Small trend cards make repeat panels easier to compare at a glance."
            />
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-[1.8rem] border-white/10 bg-[#141419] text-white shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white">Upload lab test results</CardTitle>
              <CardDescription className="max-w-2xl text-white/58">
                PDF or image files are stored securely. Supported PDF reports are extracted
                automatically; use manual entry only when extraction misses values.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.6rem] border border-dashed border-white/14 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] p-8 text-center transition-colors hover:border-[#ff8b49]/50">
                <input
                  type="file"
                  id="lab-upload"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                  onChange={handleFileChange}
                />
                <label htmlFor="lab-upload" className="cursor-pointer">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fb7b34] to-[#ef5f2c] shadow-[0_16px_30px_rgba(239,95,44,0.28)]">
                    <Upload className="h-7 w-7 text-white" />
                  </div>
                  <p className="mb-2 text-sm text-white/72">
                    {selectedFile ? selectedFile.name : "Click to choose a file"}
                  </p>
                  <p className="text-xs text-white/45">PDF, PNG, or JPG up to 10MB</p>
                </label>
              </div>
              {selectedFile && (
                <div className="mt-4 flex items-center gap-2 text-sm text-white/70">
                  <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Ready to upload and extract biomarkers from the report.</span>
                </div>
              )}
              <Button
                className="mt-5 h-12 w-full rounded-2xl bg-gradient-to-r from-[#fb7b34] to-[#ef5f2c] text-white hover:from-[#ff8b49] hover:to-[#f36a35]"
                disabled={!selectedFile || submitting}
                onClick={() => void handleSubmit()}
              >
                {submitting ? "Uploading..." : "Upload lab report"}
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-[1.8rem] border-white/10 bg-[#141419] text-white shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-white">Recent portal activity</CardTitle>
              <CardDescription className="text-white/58">
                Stored reports and the current readiness of your patient workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentUploads.length > 0 ? (
                recentUploads.map((upload) => (
                  <div
                    key={upload.id}
                    className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{upload.original_filename}</p>
                      <p className="mt-1 text-xs text-white/45">
                        Added {new Date(upload.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/65">
                      Stored
                    </span>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-white/8 bg-black/20 px-4 py-6 text-sm text-white/58">
                  No reports uploaded yet. Your first file will appear here once it is stored.
                </div>
              )}

              <div className="rounded-[1.6rem] border border-[#8f7cff]/20 bg-[linear-gradient(135deg,rgba(143,124,255,0.12),rgba(255,255,255,0.03))] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-[#b7abff]">Care readiness</p>
                <p className="mt-3 text-lg font-medium text-white">
                  {hasPanels ? "Insights are live across the portal." : "Upload and extract one panel to unlock deeper insights."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <p className="text-sm text-white/52">Loading your reports...</p>
        ) : panelsLoading ? (
          <p className="text-sm text-white/52">Loading your lab analysis...</p>
        ) : hasLabReports ? (
          <div className="space-y-6">
            {latestPanel ? (
              <Card className="rounded-[1.8rem] border-white/10 bg-[#141419] text-white shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Latest lab analysis</CardTitle>
                  <CardDescription className="text-white/58">
                    Based on the values recorded for {formatLabDate(latestPanel.recorded_at)}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert
                    className={
                      overall?.tone === "attention"
                        ? "border-amber-500/25 bg-amber-500/10 text-amber-50"
                        : "border-emerald-500/25 bg-emerald-500/10 text-emerald-50"
                    }
                  >
                    {overall?.tone === "attention" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    <AlertTitle>{overall?.label}</AlertTitle>
                    <AlertDescription>{overall?.summary}</AlertDescription>
                  </Alert>

                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {topMetrics.map((metric) => (
                      <div key={metric.key} className="rounded-[1.4rem] border border-white/8 bg-black/20 p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-[#ff9d66]" />
                          <p className="text-sm font-medium text-white">{metric.label}</p>
                        </div>
                        <p className="text-2xl font-semibold text-white">{getMetricValueLabel(metric)}</p>
                        <p className="mt-1 text-xs text-white/45">Range: {metric.range}</p>
                        <p className="mt-2 text-sm text-white/58">{metric.summary}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-[1.8rem] border-white/10 bg-[#141419] text-white shadow-[0_25px_60px_rgba(0,0,0,0.35)]">
                <CardHeader>
                  <CardTitle className="text-xl text-white">Analysis pending values</CardTitle>
                  <CardDescription className="text-white/58">Uploads alone do not create biomarkers</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white/58">
                    Your files are stored correctly, but this app needs the key report values entered
                    once before it can generate records, disease prediction, nutrition guidance, and
                    wellness insights.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
