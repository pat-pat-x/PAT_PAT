"use client";

import { Pt, samplePolyline } from "@/lib/zodiac";
import { useMemo } from "react";

type ConstellationSvgProps = {
  anchorPoints: Pt[]; // 앵커 포인트 (염소자리 등)
  daysCount: number; // 시즌 일수
  entries: Record<string, { content: string; emotion_polarity?: string; emotion_intensity?: number | null }>; // 날짜별 글
  dates: string[]; // 날짜 리스트 (순서대로)
  todayDate: string; // "YYYY-MM-DD" 형식의 오늘 날짜
  onStarClick?: (date: string, index: number) => void;
};

function getStarColor(polarity?: string, intensity?: number | null): string {
  if (!polarity || polarity === "UNSET") return "rgba(255,255,255,1)";
  if (polarity === "POSITIVE") {
    // 푸른색 - 대비를 훨씬 더 명확하게
    if (intensity != null && intensity >= 4) return "#1E3A8A"; // 매우 진한 파란색
    if (intensity === 3) return "#2563EB"; // 중간 파란색
    return "#93C5FD"; // 매우 밝은 파란색
  }
  if (polarity === "NEGATIVE") {
    // 붉은색 - 대비를 훨씬 더 명확하게
    if (intensity != null && intensity >= 4) return "#991B1B"; // 매우 진한 빨간색
    if (intensity === 3) return "#DC2626"; // 중간 빨간색
    return "#FCA5A5"; // 매우 밝은 빨간색
  }
  return "rgba(255,255,255,1)";
}

// 색상별, 강도별 글로우 필터 ID 반환
function getGlowFilterId(polarity?: string, intensity?: number | null): string {
  if (!polarity || polarity === "UNSET") return "defaultGlow";

  const intensityLevel = intensity != null && intensity >= 4 ? "strong"
    : intensity === 3 ? "medium"
    : "weak";

  return `${polarity.toLowerCase()}Glow${intensityLevel}`;
}

export default function ConstellationSvg({
  anchorPoints,
  daysCount,
  entries,
  dates,
  todayDate,
  onStarClick,
}: ConstellationSvgProps) {
  // 앵커 포인트를 시즌 일수만큼 샘플링
  const starPoints = useMemo(() => {
    if (!anchorPoints || anchorPoints.length === 0 || daysCount === 0) {
      console.warn("[ConstellationSvg] Invalid anchorPoints or daysCount:", {
        anchorPointsLength: anchorPoints?.length,
        daysCount,
      });
      return [];
    }
    const points = samplePolyline(anchorPoints, daysCount);
    console.log("[ConstellationSvg] Generated star points:", points.length);
    return points;
  }, [anchorPoints, daysCount]);

  // 각 별의 상태 계산
  const starStates = useMemo(() => {
    return dates.map((date, index) => {
      const entry = entries[date];
      const hasEntry = !!entry;
      const isToday = date === todayDate;
      const starColor = hasEntry
        ? getStarColor(entry.emotion_polarity, entry.emotion_intensity)
        : "rgba(255,255,255,1)";
      return {
        date,
        index,
        hasEntry,
        isToday,
        isActive: hasEntry || isToday,
        brightness: isToday && hasEntry ? 1.0 : hasEntry ? 0.7 : 0.3, // 오늘 별자리 글 있으면 1.0, 글 있으면 0.7, 글 없으면 0.3
        starColor,
      };
    });
  }, [dates, entries, todayDate]);

  if (starPoints.length === 0) {
    return (
      <div className="text-white/60 text-sm text-center py-8">
        별자리 데이터가 없습니다.
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className="w-full h-auto min-h-[300px]"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="별자리"
    >
      <defs>
        {/* 기본 글로우 (흰색) - 더 부드럽게 */}
        <filter id="defaultGlow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 푸른색 글로우 - 3단계 명확한 차별화 */}
        <filter id="positiveglowstrong" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feColorMatrix in="coloredBlur" type="matrix" values="0 0.05 0.5 0 0  0 0.1 0.6 0 0  0 0.3 0.8 0 0  0 0 0 0.9 0" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="positiveglowmedium" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feColorMatrix in="coloredBlur" type="matrix" values="0 0.15 0.65 0 0  0 0.25 0.75 0 0  0 0.45 0.95 0 0  0 0 0 0.75 0" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="positiveglowweak" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feColorMatrix in="coloredBlur" type="matrix" values="0 0.4 1 0 0  0 0.5 1 0 0  0 0.7 1 0 0  0 0 0 0.6 0" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 붉은색 글로우 - 3단계 명확한 차별화 */}
        <filter id="negativeglowstrong" x="-150%" y="-150%" width="400%" height="400%">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feColorMatrix in="coloredBlur" type="matrix" values="0.7 0.02 0 0 0  0.1 0.02 0 0 0  0.02 0 0 0 0  0 0 0 0.9 0" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="negativeglowmedium" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feColorMatrix in="coloredBlur" type="matrix" values="0.85 0.05 0 0 0  0.15 0.05 0 0 0  0.05 0.01 0 0 0  0 0 0 0.75 0" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        <filter id="negativeglowweak" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
          <feColorMatrix in="coloredBlur" type="matrix" values="1 0.4 0.2 0 0  0.5 0.3 0.15 0 0  0.3 0.15 0.1 0 0  0 0 0 0.6 0" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 연결선 그라디언트 */}
        <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.6)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
        </linearGradient>

        {/* 별 그라디언트 (중심이 밝고 주변으로 퍼지는 효과) - intensity에 따라 다르게 */}
        {starPoints.map((point, index) => {
          const state = starStates[index];
          const starColor = state.starColor;
          const hasEntry = state.hasEntry;
          const entry = entries[state.date];
          const intensity = entry?.emotion_intensity;

          // intensity에 따라 그라디언트 opacity 조정
          let centerOpacity: number, midOpacity: number, outerOpacity: number;

          if (!hasEntry) {
            centerOpacity = 0.9;
            midOpacity = 0.5;
            outerOpacity = 0.2;
          } else if (intensity != null && intensity >= 4) {
            // 강함 - 더 진하고 높은 opacity
            centerOpacity = 1.0;
            midOpacity = 0.85;
            outerOpacity = 0.6;
          } else if (intensity === 3) {
            // 중간
            centerOpacity = 1.0;
            midOpacity = 0.75;
            outerOpacity = 0.5;
          } else {
            // 약함 - 더 밝고 낮은 opacity
            centerOpacity = 0.95;
            midOpacity = 0.6;
            outerOpacity = 0.3;
          }

          return (
            <radialGradient key={`starGrad-${index}`} id={`starGrad-${index}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={starColor} stopOpacity={centerOpacity} />
              <stop offset="30%" stopColor={starColor} stopOpacity={midOpacity} />
              <stop offset="60%" stopColor={starColor} stopOpacity={outerOpacity} />
              <stop offset="100%" stopColor={starColor} stopOpacity="0" />
            </radialGradient>
          );
        })}
      </defs>

      {/* 연결선 */}
      {starPoints.slice(0, -1).map((p, i) => {
        const q = starPoints[i + 1];
        const state1 = starStates[i];
        const state2 = starStates[i + 1];
        const isActive = state1.isActive && state2.isActive;

        return (
          <line
            key={`line-${i}`}
            x1={p.x}
            y1={p.y}
            x2={q.x}
            y2={q.y}
            stroke="rgba(255,255,255,0.4)"
            strokeWidth={isActive ? 0.3 : 0.15}
            strokeOpacity={isActive ? 0.8 : 0.3}
            strokeLinecap="round"
          />
        );
      })}

      {/* 별들 */}
      {starPoints.map((point, index) => {
        const state = starStates[index];
        const hasEntry = state.hasEntry;
        const isToday = state.isToday;
        const brightness = state.brightness;
        const starColor = state.starColor;
        const entry = entries[state.date];

        // 글로우 필터 ID 결정
        const glowFilterId = hasEntry
          ? getGlowFilterId(entry.emotion_polarity, entry.emotion_intensity)
          : "defaultGlow";

        // 별 크기 계산 (intensity에 따라 차등 적용 - 더 큰 차이)
        let mainRadius: number;
        let centerRadius: number;

        if (!hasEntry) {
          mainRadius = 1.5;
          centerRadius = 0.3;
        } else {
          const intensity = entry.emotion_intensity;
          const baseSize = isToday ? 0.4 : 0; // 오늘이면 0.4 추가

          if (intensity != null && intensity >= 4) {
            // 강함 (strong) - 가장 크고 진한 색
            mainRadius = 4.0 + baseSize;
            centerRadius = 0.85 + (baseSize * 0.3);
          } else if (intensity === 3) {
            // 중간 (medium) - 중간 크기와 색
            mainRadius = 2.8 + baseSize;
            centerRadius = 0.65 + (baseSize * 0.25);
          } else {
            // 약함 (weak) - 가장 작고 밝은 색
            mainRadius = 1.8 + baseSize;
            centerRadius = 0.45 + (baseSize * 0.2);
          }
        }

        return (
          <g key={`star-${index}`}>
            {/* 별 원 (메인) - 중심이 밝고 주변으로 퍼지는 효과 */}
            <circle
              cx={point.x}
              cy={point.y}
              r={mainRadius}
              fill={`url(#starGrad-${index})`}
              filter={hasEntry ? `url(#${glowFilterId})` : "url(#defaultGlow)"}
              style={{ cursor: "pointer", transition: "all 0.3s ease" }}
              onClick={() => onStarClick?.(state.date, index)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onStarClick?.(state.date, index);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${state.date} ${hasEntry ? "글 있음" : "글 없음"}`}
            />

            {/* 중심 밝은 점 (가장 밝은 부분) - intensity에 따라 opacity 조정 */}
            <circle
              cx={point.x}
              cy={point.y}
              r={centerRadius}
              fill={starColor}
              fillOpacity={
                !hasEntry ? 0.9
                : (entry.emotion_intensity != null && entry.emotion_intensity >= 4) ? 1.0
                : entry.emotion_intensity === 3 ? 0.95
                : 0.9
              }
              style={{ pointerEvents: "none" }}
            />
          </g>
        );
      })}
    </svg>
  );
}
