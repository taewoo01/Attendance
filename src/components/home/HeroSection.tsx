"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import type { AttendanceMember } from "@/components/attendance/AttendanceList";
import { useRotatingCheckinQr } from "@/lib/attendance/useRotatingQr";

type HeroSectionProps = {
  children: ReactNode;
  myName: string;
  initialCheckedIn: boolean;
  attendance: AttendanceMember[];
};

/**
 * header.hero 전체(인사말/워드마크/출석 체크 버튼 + QR/출석현황 모달)를 담당한다.
 * 3D 배터리 그래픽(Battery3D)은 상태가 필요 없는 순수 정적 그래픽이라
 * children으로 전달받아 Server Component로 남긴다(불필요한 use client 확대 방지).
 * 원본 DOM 순서(왼쪽 컬럼 → QR 모달 → 출석현황 모달 → scope-frame)를 그대로 유지한다.
 * TASK-030: 인사말/출석현황 모달을 page.tsx가 조회한 실제 profiles/attendance로
 * 채운다. QR 모달은 CheckinCard와 동일하게 useRotatingCheckinQr(AGENTS.md 11.3절)로
 * 실제 스캔 가능한 회전 QR을 보여준다 — 수동으로 "완료" 처리하는 버튼은 정적 QR
 * 우회가 되므로 두지 않는다. checkedIn(오늘 이미 체크인했는지)은 page.tsx가 조회한
 * 실제 DB 값(initialCheckedIn)을 그대로 쓴다.
 */
export function HeroSection({ children, myName, initialCheckedIn, attendance }: HeroSectionProps) {
  const checkedIn = initialCheckedIn;
  const [qrOpen, setQrOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  return (
    <header className="mx-auto grid max-w-[1220px] grid-cols-[0.85fr_1fr] items-center gap-[50px] px-7 pt-[52px] pb-16 max-[900px]:grid-cols-1 max-[900px]:pt-10">
      <div>
        <p className="m-0 text-[22px] font-semibold text-silk">
          안녕하세요, {myName}님 <span className="inline-block">👋</span>
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
          {qrOpen && <HeroQrModalBody />}
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
            {attendance.map((member) => (
              <div
                key={member.userId}
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

function HeroQrModalBody() {
  const { qrDataUrl, error } = useRotatingCheckinQr(184);

  return (
    <>
      <div className="mx-auto mb-4 flex h-[184px] w-[184px] items-center justify-center rounded-input border border-border bg-bg-raised shadow-[0_0_0_1px_rgba(72,217,176,0.06)]">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="출석 체크인 QR 코드" className="h-full w-full" />
        ) : (
          <p className="font-mono text-xs text-silk-faint">
            {error ? "QR을 불러오지 못했습니다. 재시도 중..." : "QR 생성 중..."}
          </p>
        )}
      </div>
      <p className="m-0 text-center text-[12.5px] leading-[1.5] text-silk-dim">
        이 QR을 폰 카메라로 스캔하면 체크인됩니다 · QR은 주기적으로 갱신됩니다
      </p>
    </>
  );
}
