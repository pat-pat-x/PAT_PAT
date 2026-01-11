"use client";

import { useEffect, useRef } from "react";

/**
 * BaseModal
 * - 에러/안내 공통으로 쓰는 모달 베이스
 * - ESC 닫기, 바깥 클릭 닫기 옵션, 간단 포커스 이동 포함
 */
type BaseModalProps = {
  open: boolean;
  title?: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;

  /** 확인 버튼 텍스트 */
  confirmText?: string;
  /** 취소 버튼 텍스트 (없으면 버튼 자체 숨김) */
  cancelText?: string;

  /** 확인 클릭 */
  onConfirm?: () => void | Promise<void>;
  /** 취소/닫기 클릭 */
  onClose: () => void;

  /** 오버레이/ESC로 닫기 허용 (기본 true) */
  dismissible?: boolean;

  /** 상단 아이콘/톤 */
  tone?: "info" | "error";
};

export function BaseModal({
  open,
  title,
  description,
  children,
  confirmText = "확인",
  cancelText,
  onConfirm,
  onClose,
  dismissible = true,
  tone = "info",
}: BaseModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // 포커스 이동
    const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (!dismissible) return;
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, dismissible, onClose]);

  if (!open) return null;

  const toneStyles =
   tone === "error"
    ? {
        ring: "shadow-[0_0_0_3px_rgba(167,139,250,0.10)]", // violet halo
        badge:
          "bg-[radial-gradient(circle_at_50%_20%,rgba(167,139,250,0.25)_0,transparent_55%)]",
        title: "text-white",
        desc: "text-white/65",
        icon: (
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/5">
            {/* 작은 점 기반 아이콘 */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle
                cx="12"
                cy="12"
                r="6"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <circle
                cx="12"
                cy="12"
                r="1.5"
                fill="currentColor"
              />
            </svg>
          </span>
        ),
        confirmBtn:
          "bg-[linear-gradient(180deg,#2b255a_0%,#171236_100%)] border border-white/12",
      }
      : {
          ring: "shadow-[0_0_0_4px_rgba(56,189,248,0.10)]",
          badge:
            "bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.35)_0,transparent_48%),radial-gradient(circle_at_70%_60%,rgba(56,189,248,0.18)_0,transparent_52%)]",
          title: "text-white",
          desc: "text-white/70",
          icon: (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5">
              {/* 간단한 정보 아이콘 */}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 17v-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M12 7h.01"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="currentColor"
                  strokeWidth="1.8"
                />
              </svg>
            </span>
          ),
          confirmBtn:
            "bg-[linear-gradient(180deg,#18326f_0%,#0b1d4a_100%)] border border-white/14",
        };

  const onOverlayClick = () => {
    if (!dismissible) return;
    onClose();
  };

  const onCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center px-5"
      onMouseDown={onOverlayClick}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      {/* card */}
      <div
        onMouseDown={onCardClick}
        className={[
          "relative w-full max-w-[420px] rounded-2xl",
          "border border-white/15 bg-white/8 backdrop-blur-xl",
          "p-5",
          toneStyles.ring,
        ].join(" ")}
      >
        {/* subtle glow */}
        <div
          aria-hidden
          className={[
            "pointer-events-none absolute inset-0 rounded-2xl opacity-[0.35]",
            toneStyles.badge,
          ].join(" ")}
        />

<div className="relative">
          <div className="flex items-start gap-3">
            {toneStyles.icon}
            <div className="min-w-0">
              {title && (
                <h3 className={["text-[15px] font-semibold", toneStyles.title].join(" ")}>
                  {title}
                </h3>
              )}
              {description && (
                <div className={["mt-1 text-[13px] leading-relaxed", toneStyles.desc].join(" ")}>
                  {description}
                </div>
              )}
            </div>
          </div>

          {children && <div className="mt-4">{children}</div>}

        <div className="mt-5 grid grid-cols-2 gap-3">
        {cancelText && (
            <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-xl bg-white/6 border border-white/12 text-[14px] text-white/80"
            >
            {cancelText}
            </button>
        )}

        <button
            ref={confirmBtnRef}
            type="button"
            onClick={async () => {
            if (onConfirm) await onConfirm();
            if (dismissible) onClose();
            }}
            className={[
            "h-11 rounded-xl text-[14px] font-medium text-white/80",
            toneStyles.confirmBtn,
            cancelText
                ? "" // cancel 있을 땐 오른쪽 칸
                : "col-span-2 mx-auto w-[160px]", // ❗ 가운데 정렬
            ].join(" ")}
        >
            {confirmText}
        </button>
        </div>  
        </div>
      </div>
    </div>
  );
}

/** 안내용(일반) 모달 */
export function InfoModal(props: Omit<BaseModalProps, "tone">) {
  return <BaseModal tone="info" {...props} />;
}

/** 에러용 모달 */
export function ErrorModal(props: Omit<BaseModalProps, "tone">) {
  return <BaseModal tone="error" {...props} />;
}
