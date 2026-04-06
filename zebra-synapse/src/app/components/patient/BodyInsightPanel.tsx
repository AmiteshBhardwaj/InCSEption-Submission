import { useMemo, useState } from "react";
import { cn } from "../ui/utils";
import { type MetricAssessment, getMetricValueLabel } from "../../../lib/labInsights";

type Region = {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  metricKeys: string[];
};

const REGIONS: Region[] = [
  { id: "brain", label: "Brain + Nervous", x: 124, y: 32, w: 52, h: 52, metricKeys: ["vitamin_b12"] },
  { id: "spine", label: "Nervous Spine", x: 145, y: 88, w: 10, h: 174, metricKeys: ["vitamin_b12"] },
  { id: "heart", label: "Heart + Arteries", x: 112, y: 122, w: 76, h: 56, metricKeys: ["homocysteine", "ldl", "total_cholesterol", "triglycerides", "hdl"] },
  { id: "pancreas", label: "Pancreas", x: 108, y: 190, w: 84, h: 38, metricKeys: ["hemoglobin_a1c", "fasting_glucose"] },
  { id: "kidneys", label: "Kidneys", x: 103, y: 232, w: 94, h: 40, metricKeys: ["urea", "blood_urea_nitrogen"] },
  { id: "lymph-neck", label: "Lymph Nodes (Neck)", x: 136, y: 86, w: 28, h: 16, metricKeys: ["ige", "lymphocytes_percent", "absolute_lymphocyte_count"] },
  { id: "lymph-left", label: "Lymph Nodes (Left Axillary)", x: 96, y: 122, w: 20, h: 20, metricKeys: ["ige", "lymphocytes_percent", "absolute_lymphocyte_count"] },
  { id: "lymph-right", label: "Lymph Nodes (Right Axillary)", x: 184, y: 122, w: 20, h: 20, metricKeys: ["ige", "lymphocytes_percent", "absolute_lymphocyte_count"] },
  { id: "bones-head", label: "Bone Health (Skull)", x: 136, y: 24, w: 28, h: 28, metricKeys: ["vitamin_d_25_oh"] },
  { id: "bones-chest", label: "Bone Health (Thorax)", x: 128, y: 132, w: 44, h: 24, metricKeys: ["vitamin_d_25_oh"] },
  { id: "bones-pelvis", label: "Bone Health (Pelvis)", x: 128, y: 206, w: 44, h: 24, metricKeys: ["vitamin_d_25_oh"] },
  { id: "bones-legs", label: "Bone Health (Leg Bones)", x: 132, y: 274, w: 36, h: 38, metricKeys: ["vitamin_d_25_oh"] },
];

function getSeverityColor(hasCritical: boolean) {
  return hasCritical
    ? "border-[#FF4D4D]/80 bg-[#FF4D4D]/22 shadow-[0_0_32px_rgba(255,77,77,0.45)]"
    : "border-[#FFC857]/80 bg-[#FFC857]/20 shadow-[0_0_24px_rgba(255,200,87,0.36)]";
}

function statusText(status: MetricAssessment["status"]) {
  if (status === "high") return "High";
  if (status === "low") return "Low";
  if (status === "borderline") return "Needs Monitoring";
  return "Normal";
}

export function BodyInsightPanel({
  metrics,
  focusedMetricKeys,
  onFocusMetricKeys,
}: {
  metrics: MetricAssessment[];
  focusedMetricKeys: string[];
  onFocusMetricKeys: (keys: string[]) => void;
}) {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const regionIssueMap = useMemo(() => {
    const map = new Map<
      string,
      { critical: MetricAssessment[]; other: MetricAssessment[]; all: MetricAssessment[] }
    >();

    REGIONS.forEach((region) => {
      const related = metrics.filter(
        (metric) => region.metricKeys.includes(metric.key) && (metric.status === "high" || metric.status === "low" || metric.status === "borderline"),
      );
      const critical = related.filter((metric) => metric.status === "high");
      const other = related.filter((metric) => metric.status !== "high");
      map.set(region.id, { critical, other, all: related });
    });

    return map;
  }, [metrics]);

  const hasAbnormal = [...regionIssueMap.values()].some((items) => items.all.length > 0);
  const activeRegionCount = [...regionIssueMap.values()].filter((items) => items.all.length > 0).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white/70">Body Insight Panel</h3>
        {!hasAbnormal ? <span className="text-xs text-emerald-300">Within normal range</span> : null}
      </div>

      <div className="relative mx-auto h-[340px] w-[300px] max-w-full">
        <svg viewBox="0 0 300 340" className="h-full w-full">
          <defs>
            <linearGradient id="bodyGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
          </defs>
          <g opacity="0.75">
            <circle cx="150" cy="48" r="26" fill="url(#bodyGlow)" />
            <rect x="122" y="74" width="56" height="86" rx="24" fill="url(#bodyGlow)" />
            <rect x="90" y="84" width="22" height="100" rx="11" fill="url(#bodyGlow)" />
            <rect x="188" y="84" width="22" height="100" rx="11" fill="url(#bodyGlow)" />
            <rect x="126" y="156" width="20" height="122" rx="10" fill="url(#bodyGlow)" />
            <rect x="154" y="156" width="20" height="122" rx="10" fill="url(#bodyGlow)" />
          </g>
        </svg>

        {REGIONS.map((region) => {
          const issueSet = regionIssueMap.get(region.id);
          if (!issueSet || issueSet.all.length === 0) return null;
          const relatedFocused = focusedMetricKeys.some((key) => region.metricKeys.includes(key));
          const hasCritical = issueSet.critical.length > 0;
          const metricKeys = [...new Set(issueSet.all.map((item) => item.key))];

          return (
            <button
              key={region.id}
              type="button"
              className={cn(
                "absolute rounded-full border transition-all duration-200",
                getSeverityColor(hasCritical),
                hasCritical ? "animate-pulse" : "",
                relatedFocused ? "scale-[1.08]" : "opacity-95 hover:scale-[1.05]",
              )}
              style={{ left: region.x, top: region.y, width: region.w, height: region.h }}
              onMouseEnter={() => {
                setHoveredRegion(region.id);
                onFocusMetricKeys(metricKeys);
              }}
              onMouseLeave={() => {
                setHoveredRegion(null);
                onFocusMetricKeys([]);
              }}
              onClick={() => {
                const nodes = metricKeys
                  .map((key) => document.getElementById(`biomarker-card-${key}`))
                  .filter((node): node is HTMLElement => Boolean(node));
                if (nodes.length === 0) return;
                nodes[0].scrollIntoView({ behavior: "smooth", block: "center" });
                nodes.forEach((node) => node.classList.add("ring-2", "ring-[#FF6A00]"));
                setTimeout(() => {
                  nodes.forEach((node) => node.classList.remove("ring-2", "ring-[#FF6A00]"));
                }, 1100);
              }}
            />
          );
        })}

        {hoveredRegion ? (
          <div className="absolute left-1/2 top-2 z-20 w-[260px] -translate-x-1/2 rounded-xl border border-white/10 bg-[#1f1f20]/95 p-3 text-left shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            {(() => {
              const region = REGIONS.find((item) => item.id === hoveredRegion);
              const values = regionIssueMap.get(hoveredRegion);
              if (!region || !values || values.all.length === 0) return null;

              return (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/55">{region.label}</p>
                  {values.all.map((metric) => (
                    <div key={metric.key} className="rounded-lg border border-white/10 bg-white/5 p-2">
                      <p className="text-sm font-semibold text-white">{metric.label}</p>
                      <p className="text-xs text-white/65">
                        {getMetricValueLabel(metric)} · {statusText(metric.status)}
                      </p>
                      <p className="text-xs text-white/55">{metric.summary}</p>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : null}

        {!hasAbnormal ? (
          <div className="absolute bottom-3 left-1/2 w-[250px] -translate-x-1/2 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-center text-xs text-emerald-200">
            Your body indicators are within normal range
          </div>
        ) : null}

        {hasAbnormal && activeRegionCount > 1 ? (
          <div className="absolute bottom-3 left-1/2 w-[250px] -translate-x-1/2 rounded-lg border border-[#FF6A00]/35 bg-[#FF6A00]/10 px-3 py-2 text-center text-xs text-[#ffd0b4]">
            Multiple areas require attention
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-center gap-3 text-xs text-white/70">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FF4D4D]" />
          Critical
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#FFC857]" />
          Needs Attention
        </span>
      </div>
    </div>
  );
}
