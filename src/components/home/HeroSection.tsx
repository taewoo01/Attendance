"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";

/**
 * playground-design/index.html의 QR 체크인 모달/출석 현황 모달 mock 데이터.
 * 실제 인증/DB 연동 전까지 원본 하드코딩 값을 local constant로 유지한다
 * (docs/MIGRATION.md 8절 Mock Data Migration).
 */
const ATTENDANCE = [
  { avatar: "연", name: "김연구", role: "AI솔루션 팀 · BMS", time: "09:02", status: "on" as const },
  { avatar: "하", name: "이하늘", role: "AI솔루션 팀 · BMS", time: "08:47", status: "on" as const },
  { avatar: "준", name: "박준서", role: "AI솔루션 팀 · Firmware", time: "09:15", status: "on" as const },
  { avatar: "도", name: "최도윤", role: "AI솔루션 팀 · Firmware", time: "09:31", status: "on" as const },
  { avatar: "민", name: "정민재", role: "AI솔루션 팀 · Data", time: "10:04", status: "on" as const },
  { avatar: "서", name: "한서준", role: "AI솔루션 팀 · Data", time: "—", status: "off" as const },
  { avatar: "지", name: "오지훈", role: "AI솔루션 팀 · PM", time: "—", status: "off" as const },
  { avatar: "태", name: "강태윤", role: "AI솔루션 팀 · PM", time: "—", status: "off" as const },
];

/**
 * header.hero 전체(인사말/워드마크/출석 체크 버튼 + QR/출석현황 모달)를 담당한다.
 * 3D 배터리 그래픽(Battery3D)은 상태가 필요 없는 순수 정적 그래픽이라
 * children으로 전달받아 Server Component로 남긴다(불필요한 use client 확대 방지).
 * 원본 DOM 순서(왼쪽 컬럼 → QR 모달 → 출석현황 모달 → scope-frame)를 그대로 유지한다.
 */
export function HeroSection({ children }: { children: ReactNode }) {
  const [checkedIn, setCheckedIn] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <header className="mx-auto grid max-w-[1220px] grid-cols-[0.85fr_1fr] items-center gap-[50px] px-7 pt-[52px] pb-16 max-[900px]:grid-cols-1 max-[900px]:pt-10">
      <div>
        <p className="m-0 text-[22px] font-semibold text-silk">
          안녕하세요, 김연구님 <span className="inline-block">👋</span>
        </p>
        <h1 className="m-0 mt-[18px] font-mono text-[64px] font-bold leading-[0.92] tracking-[-0.01em] text-silk max-[900px]:text-[46px]">
          PLAY
          <br />
          <span className="text-teal">GROUND</span>
        </h1>
        <div className="mt-[26px] mb-8 h-[3px] w-16 bg-teal" />
        <div className="flex gap-[14px]">
          <button
            type="button"
            onClick={() => (checkedIn ? setStatusOpen(true) : setQrOpen(true))}
            className={
              checkedIn
                ? "inline-flex cursor-pointer items-center gap-2 border border-teal bg-transparent px-5 py-[13px] text-[13.5px] font-semibold text-teal"
                : "inline-flex cursor-pointer items-center gap-2 border border-teal bg-teal px-5 py-[13px] text-[13.5px] font-semibold text-[#04231b]"
            }
          >
            {checkedIn ? "✓ 오늘 출석 현황 보기" : "▸ 오늘 출석 체크"}
          </button>
          <Link
            href="/schedule"
            className="inline-flex items-center gap-2 border border-border bg-transparent px-5 py-[13px] text-[13.5px] font-semibold text-silk"
          >
            전체 일정 보기
          </Link>
        </div>
      </div>

      {/* QR check-in modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[rgba(4,10,9,0.72)] backdrop-blur-sm [transition:opacity_.18s_ease] ${
          qrOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setQrOpen(false);
        }}
      >
        <div
          className={`w-80 rounded-card border border-border bg-bg-panel px-[22px] pt-[22px] pb-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] [transition:transform_.18s_ease] ${
            qrOpen ? "translate-y-0" : "translate-y-2"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-silk-faint">QR CHECK-IN</p>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setQrOpen(false)}
              className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-sm text-silk-faint hover:text-silk"
            >
              ✕
            </button>
          </div>
          <div className="mx-auto mb-4 flex h-[184px] w-[184px] items-center justify-center rounded-input border border-border bg-bg-raised shadow-[0_0_0_1px_rgba(72,217,176,0.06)]">
            <svg viewBox="0 0 168 168" className="h-[168px] w-[168px]">
              <g>
                <rect x="0" y="0" width="8" height="8" />
                <rect x="8" y="0" width="8" height="8" />
                <rect x="16" y="0" width="8" height="8" />
                <rect x="24" y="0" width="8" height="8" />
                <rect x="32" y="0" width="8" height="8" />
                <rect x="40" y="0" width="8" height="8" />
                <rect x="48" y="0" width="8" height="8" />
                <rect x="56" y="0" width="8" height="8" />
                <rect x="64" y="0" width="8" height="8" />
                <rect x="80" y="0" width="8" height="8" />
                <rect x="96" y="0" width="8" height="8" />
                <rect x="104" y="0" width="8" height="8" />
                <rect x="112" y="0" width="8" height="8" />
                <rect x="120" y="0" width="8" height="8" />
                <rect x="128" y="0" width="8" height="8" />
                <rect x="136" y="0" width="8" height="8" />
                <rect x="144" y="0" width="8" height="8" />
                <rect x="152" y="0" width="8" height="8" />
                <rect x="160" y="0" width="8" height="8" />
                <rect x="0" y="8" width="8" height="8" />
                <rect x="48" y="8" width="8" height="8" />
                <rect x="64" y="8" width="8" height="8" />
                <rect x="80" y="8" width="8" height="8" />
                <rect x="88" y="8" width="8" height="8" />
                <rect x="112" y="8" width="8" height="8" />
                <rect x="160" y="8" width="8" height="8" />
                <rect x="0" y="16" width="8" height="8" />
                <rect x="16" y="16" width="8" height="8" />
                <rect x="24" y="16" width="8" height="8" />
                <rect x="32" y="16" width="8" height="8" />
                <rect x="48" y="16" width="8" height="8" />
                <rect x="56" y="16" width="8" height="8" />
                <rect x="64" y="16" width="8" height="8" />
                <rect x="96" y="16" width="8" height="8" />
                <rect x="112" y="16" width="8" height="8" />
                <rect x="128" y="16" width="8" height="8" />
                <rect x="136" y="16" width="8" height="8" />
                <rect x="144" y="16" width="8" height="8" />
                <rect x="160" y="16" width="8" height="8" />
                <rect x="0" y="24" width="8" height="8" />
                <rect x="16" y="24" width="8" height="8" />
                <rect x="24" y="24" width="8" height="8" />
                <rect x="32" y="24" width="8" height="8" />
                <rect x="48" y="24" width="8" height="8" />
                <rect x="56" y="24" width="8" height="8" />
                <rect x="72" y="24" width="8" height="8" />
                <rect x="80" y="24" width="8" height="8" />
                <rect x="88" y="24" width="8" height="8" />
                <rect x="96" y="24" width="8" height="8" />
                <rect x="112" y="24" width="8" height="8" />
                <rect x="128" y="24" width="8" height="8" />
                <rect x="136" y="24" width="8" height="8" />
                <rect x="144" y="24" width="8" height="8" />
                <rect x="160" y="24" width="8" height="8" />
                <rect x="0" y="32" width="8" height="8" />
                <rect x="16" y="32" width="8" height="8" />
                <rect x="24" y="32" width="8" height="8" />
                <rect x="32" y="32" width="8" height="8" />
                <rect x="48" y="32" width="8" height="8" />
                <rect x="56" y="32" width="8" height="8" />
                <rect x="80" y="32" width="8" height="8" />
                <rect x="96" y="32" width="8" height="8" />
                <rect x="104" y="32" width="8" height="8" />
                <rect x="112" y="32" width="8" height="8" />
                <rect x="128" y="32" width="8" height="8" />
                <rect x="136" y="32" width="8" height="8" />
                <rect x="144" y="32" width="8" height="8" />
                <rect x="160" y="32" width="8" height="8" />
                <rect x="0" y="40" width="8" height="8" />
                <rect x="48" y="40" width="8" height="8" />
                <rect x="56" y="40" width="8" height="8" />
                <rect x="80" y="40" width="8" height="8" />
                <rect x="104" y="40" width="8" height="8" />
                <rect x="112" y="40" width="8" height="8" />
                <rect x="160" y="40" width="8" height="8" />
                <rect x="0" y="48" width="8" height="8" />
                <rect x="8" y="48" width="8" height="8" />
                <rect x="16" y="48" width="8" height="8" />
                <rect x="24" y="48" width="8" height="8" />
                <rect x="32" y="48" width="8" height="8" />
                <rect x="40" y="48" width="8" height="8" />
                <rect x="48" y="48" width="8" height="8" />
                <rect x="72" y="48" width="8" height="8" />
                <rect x="112" y="48" width="8" height="8" />
                <rect x="120" y="48" width="8" height="8" />
                <rect x="128" y="48" width="8" height="8" />
                <rect x="136" y="48" width="8" height="8" />
                <rect x="144" y="48" width="8" height="8" />
                <rect x="152" y="48" width="8" height="8" />
                <rect x="160" y="48" width="8" height="8" />
                <rect x="0" y="56" width="8" height="8" />
                <rect x="16" y="56" width="8" height="8" />
                <rect x="24" y="56" width="8" height="8" />
                <rect x="40" y="56" width="8" height="8" />
                <rect x="56" y="56" width="8" height="8" />
                <rect x="96" y="56" width="8" height="8" />
                <rect x="0" y="64" width="8" height="8" />
                <rect x="40" y="64" width="8" height="8" />
                <rect x="48" y="64" width="8" height="8" />
                <rect x="64" y="64" width="8" height="8" />
                <rect x="80" y="64" width="8" height="8" />
                <rect x="88" y="64" width="8" height="8" />
                <rect x="96" y="64" width="8" height="8" />
                <rect x="112" y="64" width="8" height="8" />
                <rect x="120" y="64" width="8" height="8" />
                <rect x="128" y="64" width="8" height="8" />
                <rect x="144" y="64" width="8" height="8" />
                <rect x="24" y="72" width="8" height="8" />
                <rect x="32" y="72" width="8" height="8" />
                <rect x="40" y="72" width="8" height="8" />
                <rect x="64" y="72" width="8" height="8" />
                <rect x="72" y="72" width="8" height="8" />
                <rect x="80" y="72" width="8" height="8" />
                <rect x="88" y="72" width="8" height="8" />
                <rect x="112" y="72" width="8" height="8" />
                <rect x="120" y="72" width="8" height="8" />
                <rect x="128" y="72" width="8" height="8" />
                <rect x="136" y="72" width="8" height="8" />
                <rect x="24" y="80" width="8" height="8" />
                <rect x="64" y="80" width="8" height="8" />
                <rect x="72" y="80" width="8" height="8" />
                <rect x="80" y="80" width="8" height="8" />
                <rect x="96" y="80" width="8" height="8" />
                <rect x="104" y="80" width="8" height="8" />
                <rect x="112" y="80" width="8" height="8" />
                <rect x="120" y="80" width="8" height="8" />
                <rect x="128" y="80" width="8" height="8" />
                <rect x="136" y="80" width="8" height="8" />
                <rect x="144" y="80" width="8" height="8" />
                <rect x="152" y="80" width="8" height="8" />
                <rect x="160" y="80" width="8" height="8" />
                <rect x="0" y="88" width="8" height="8" />
                <rect x="8" y="88" width="8" height="8" />
                <rect x="32" y="88" width="8" height="8" />
                <rect x="40" y="88" width="8" height="8" />
                <rect x="48" y="88" width="8" height="8" />
                <rect x="56" y="88" width="8" height="8" />
                <rect x="64" y="88" width="8" height="8" />
                <rect x="104" y="88" width="8" height="8" />
                <rect x="112" y="88" width="8" height="8" />
                <rect x="120" y="88" width="8" height="8" />
                <rect x="128" y="88" width="8" height="8" />
                <rect x="144" y="88" width="8" height="8" />
                <rect x="152" y="88" width="8" height="8" />
                <rect x="8" y="96" width="8" height="8" />
                <rect x="24" y="96" width="8" height="8" />
                <rect x="64" y="96" width="8" height="8" />
                <rect x="72" y="96" width="8" height="8" />
                <rect x="80" y="96" width="8" height="8" />
                <rect x="112" y="96" width="8" height="8" />
                <rect x="120" y="96" width="8" height="8" />
                <rect x="8" y="104" width="8" height="8" />
                <rect x="24" y="104" width="8" height="8" />
                <rect x="32" y="104" width="8" height="8" />
                <rect x="40" y="104" width="8" height="8" />
                <rect x="48" y="104" width="8" height="8" />
                <rect x="56" y="104" width="8" height="8" />
                <rect x="112" y="104" width="8" height="8" />
                <rect x="120" y="104" width="8" height="8" />
                <rect x="128" y="104" width="8" height="8" />
                <rect x="136" y="104" width="8" height="8" />
                <rect x="144" y="104" width="8" height="8" />
                <rect x="0" y="112" width="8" height="8" />
                <rect x="8" y="112" width="8" height="8" />
                <rect x="16" y="112" width="8" height="8" />
                <rect x="24" y="112" width="8" height="8" />
                <rect x="32" y="112" width="8" height="8" />
                <rect x="40" y="112" width="8" height="8" />
                <rect x="48" y="112" width="8" height="8" />
                <rect x="88" y="112" width="8" height="8" />
                <rect x="136" y="112" width="8" height="8" />
                <rect x="152" y="112" width="8" height="8" />
                <rect x="0" y="120" width="8" height="8" />
                <rect x="48" y="120" width="8" height="8" />
                <rect x="64" y="120" width="8" height="8" />
                <rect x="72" y="120" width="8" height="8" />
                <rect x="96" y="120" width="8" height="8" />
                <rect x="104" y="120" width="8" height="8" />
                <rect x="112" y="120" width="8" height="8" />
                <rect x="136" y="120" width="8" height="8" />
                <rect x="0" y="128" width="8" height="8" />
                <rect x="16" y="128" width="8" height="8" />
                <rect x="24" y="128" width="8" height="8" />
                <rect x="32" y="128" width="8" height="8" />
                <rect x="48" y="128" width="8" height="8" />
                <rect x="56" y="128" width="8" height="8" />
                <rect x="72" y="128" width="8" height="8" />
                <rect x="80" y="128" width="8" height="8" />
                <rect x="144" y="128" width="8" height="8" />
                <rect x="152" y="128" width="8" height="8" />
                <rect x="160" y="128" width="8" height="8" />
                <rect x="0" y="136" width="8" height="8" />
                <rect x="16" y="136" width="8" height="8" />
                <rect x="24" y="136" width="8" height="8" />
                <rect x="32" y="136" width="8" height="8" />
                <rect x="48" y="136" width="8" height="8" />
                <rect x="56" y="136" width="8" height="8" />
                <rect x="72" y="136" width="8" height="8" />
                <rect x="80" y="136" width="8" height="8" />
                <rect x="88" y="136" width="8" height="8" />
                <rect x="104" y="136" width="8" height="8" />
                <rect x="0" y="144" width="8" height="8" />
                <rect x="16" y="144" width="8" height="8" />
                <rect x="24" y="144" width="8" height="8" />
                <rect x="32" y="144" width="8" height="8" />
                <rect x="48" y="144" width="8" height="8" />
                <rect x="64" y="144" width="8" height="8" />
                <rect x="80" y="144" width="8" height="8" />
                <rect x="88" y="144" width="8" height="8" />
                <rect x="104" y="144" width="8" height="8" />
                <rect x="136" y="144" width="8" height="8" />
                <rect x="0" y="152" width="8" height="8" />
                <rect x="48" y="152" width="8" height="8" />
                <rect x="56" y="152" width="8" height="8" />
                <rect x="72" y="152" width="8" height="8" />
                <rect x="80" y="152" width="8" height="8" />
                <rect x="0" y="160" width="8" height="8" />
                <rect x="8" y="160" width="8" height="8" />
                <rect x="16" y="160" width="8" height="8" />
                <rect x="24" y="160" width="8" height="8" />
                <rect x="32" y="160" width="8" height="8" />
                <rect x="40" y="160" width="8" height="8" />
                <rect x="48" y="160" width="8" height="8" />
                <rect x="112" y="160" width="8" height="8" />
                <rect x="144" y="160" width="8" height="8" />
                <rect x="152" y="160" width="8" height="8" />
              </g>
            </svg>
          </div>
          <p className="m-0 mb-4 text-center text-[12.5px] leading-[1.5] text-silk-dim">
            연구실 입구 QR을 스캔하거나 아래 버튼으로 체크인하세요
          </p>
          <button
            type="button"
            onClick={() => {
              setQrOpen(false);
              setCheckedIn(true);
            }}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 border border-teal bg-teal px-5 py-[13px] text-[13.5px] font-semibold text-[#04231b]"
          >
            ▸ 체크인 완료
          </button>
        </div>
      </div>

      {/* Attendance status modal */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-[rgba(4,10,9,0.72)] backdrop-blur-sm [transition:opacity_.18s_ease] ${
          statusOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setStatusOpen(false);
        }}
      >
        <div
          className={`w-[440px] max-h-[80vh] overflow-y-auto rounded-card border border-border bg-bg-panel px-[22px] pt-[22px] pb-6 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] [transition:transform_.18s_ease] max-[520px]:w-[92vw] ${
            statusOpen ? "translate-y-0" : "translate-y-2"
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="m-0 font-mono text-[11px] tracking-[0.14em] text-silk-faint">TODAY&apos;S ATTENDANCE</p>
            <button
              type="button"
              aria-label="닫기"
              onClick={() => setStatusOpen(false)}
              className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-sm text-silk-faint hover:text-silk"
            >
              ✕
            </button>
          </div>
          <div className="flex flex-col">
            {ATTENDANCE.map((member) => (
              <div
                key={member.name}
                className="grid grid-cols-[36px_1fr_66px_78px] items-center gap-3 border-b border-border px-0.5 py-[11px] last:border-b-0 max-[520px]:grid-cols-[30px_1fr_60px]"
              >
                <div
                  className={`flex h-[30px] w-[30px] items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                    member.status === "on"
                      ? "bg-[rgba(72,217,176,0.14)] text-teal"
                      : "bg-[rgba(231,239,236,0.06)] text-silk-faint"
                  }`}
                >
                  {member.avatar}
                </div>
                <div>
                  <div className="text-[13px] font-medium">{member.name}</div>
                  <div className="mt-px text-[10.5px] text-silk-faint">{member.role}</div>
                </div>
                <div className="font-mono text-[11.5px] text-silk-dim">{member.time}</div>
                <div
                  className={`flex items-center justify-end gap-1.5 font-mono text-[10.5px] max-[520px]:hidden ${
                    member.status === "on" ? "text-teal" : "text-silk-faint"
                  }`}
                >
                  <span
                    className={`h-[5px] w-[5px] rounded-full ${member.status === "on" ? "bg-teal" : "bg-silk-faint"}`}
                  />
                  {member.status === "on" ? "체크인" : "미출근"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {children}
    </header>
  );
}
