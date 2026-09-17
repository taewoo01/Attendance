"use client";

import Link from "next/link";
import { useState } from "react";
import { useSelfCheckinRealtime } from "@/lib/attendance/useSelfCheckinRealtime";
import { useRotatingCheckinQr } from "@/lib/attendance/useRotatingQr";

type RosterMember = { userId: string; name: string };

type QrDisplayProps = {
  /** 이 기기(키오스크) 자체의 로그인 여부. 개인 폰 로그인과는 무관하다. */
  isAdminLoggedIn: boolean;
  roster: RosterMember[];
};

/**
 * 연구실 입구 디스플레이(/attendance-display) 전용 client component.
 * 기존에는 항상 로그인 불필요한 익명 회전 QR만 보여주고, 스캔한 사람이 자기
 * 폰에서 직접 로그인해야 체크인이 완료됐다 — 폰마다 매일 로그인이 안 풀려서
 * (갤럭시 카메라 앱의 QR 미리보기가 Chrome과 쿠키를 공유하지 않는 문제) 매번
 * "스캔 → 로그인 → 다시 스캔"을 해야 하는 번거로움이 있었다(사용자 확인 완료).
 * "야매" 해결책: 이 기기 자체가 (한 번만) 로그인돼 있으면, 화면에서 본인 이름을
 * 직접 눌러 그 사람 전용 QR을 띄운다 — 로그인 대신 "입구 기기에서 자기 이름을
 * 눌렀다"로 신원 확인을 대신하는 방식이라 스캔하는 폰은 로그인 여부와 무관하게
 * 그 자리에서 바로 체크인된다(비밀번호 확인을 포기하는 트레이드오프,
 * 소규모 팀 신뢰 기반 — 사용자 확인 완료). 이 기기가 로그인돼 있지 않으면
 * 기존과 동일한 익명 회전 QR로 폴백한다(로그인 안 된 상태에서 개인 토큰을
 * 발급하면 userId만 알면 누구나 원격으로 남을 체크인시킬 수 있어 막아야 한다 —
 * qr-token API가 이걸 서버에서 강제한다).
 */
export function QrDisplay({ isAdminLoggedIn, roster }: QrDisplayProps) {
  const [selected, setSelected] = useState<RosterMember | null>(null);

  if (!isAdminLoggedIn) {
    return <AnonymousQr />;
  }

  return selected ? (
    <PersonalQr member={selected} onDone={() => setSelected(null)} />
  ) : (
    <NamePicker roster={roster} onSelect={setSelected} />
  );
}

function NamePicker({ roster, onSelect }: { roster: RosterMember[]; onSelect: (member: RosterMember) => void }) {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-6 bg-bg px-6 text-silk">
      <p className="font-mono text-sm tracking-[0.14em] text-silk-faint">연구실 입구 · 본인 이름을 눌러주세요</p>
      <div className="grid w-full max-w-[640px] grid-cols-3 gap-3 max-[480px]:grid-cols-2">
        {roster.map((member) => (
          <button
            key={member.userId}
            type="button"
            onClick={() => onSelect(member)}
            className="cursor-pointer rounded-card border border-border bg-bg-panel px-5 py-4 text-[15px] font-semibold text-silk hover:border-teal-dim hover:text-teal"
          >
            {member.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function PersonalQr({ member, onDone }: { member: RosterMember; onDone: () => void }) {
  // margin(quiet zone)이 너무 좁으면 카메라가 QR 경계를 인식하지 못한다 — qrcode 기본값(4) 사용.
  const { qrDataUrl, error } = useRotatingCheckinQr(380, member.userId);
  // 이 사람의 체크인이 실제로 찍히면 자동으로 이름 선택 화면으로 돌아간다 —
  // 다음 사람이 바로 이어서 쓸 수 있게(수동으로 "처음으로"를 누를 필요 없음).
  useSelfCheckinRealtime(member.userId, onDone);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-6 bg-bg px-6 text-silk">
      <p className="font-mono text-sm tracking-[0.14em] text-silk-faint">{member.name}님, 이 QR을 스캔해 주세요</p>

      <div className="flex h-[420px] w-[420px] items-center justify-center rounded-card border border-border bg-bg-panel p-6">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="출석 체크인 QR 코드" className="h-full w-full" />
        ) : (
          <p className="font-mono text-xs text-silk-faint">
            {error ? "QR을 불러오지 못했습니다. 재시도 중..." : "QR 생성 중..."}
          </p>
        )}
      </div>

      <p className="font-mono text-xs text-silk-faint">폰 카메라로 스캔하면 로그인 여부와 상관없이 바로 체크인됩니다</p>
      <button
        type="button"
        onClick={onDone}
        className="cursor-pointer border-none bg-transparent p-0 font-mono text-xs text-silk-faint underline hover:text-silk"
      >
        본인이 아니신가요? 처음으로
      </button>
    </div>
  );
}

function AnonymousQr() {
  const { qrDataUrl, error } = useRotatingCheckinQr(380);

  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-6 bg-bg text-silk">
      <p className="font-mono text-sm tracking-[0.14em] text-silk-faint">연구실 입구 · QR 체크인</p>

      <div className="flex h-[420px] w-[420px] items-center justify-center rounded-card border border-border bg-bg-panel p-6">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="출석 체크인 QR 코드" className="h-full w-full" />
        ) : (
          <p className="font-mono text-xs text-silk-faint">
            {error ? "QR을 불러오지 못했습니다. 재시도 중..." : "QR 생성 중..."}
          </p>
        )}
      </div>

      <p className="font-mono text-xs text-silk-faint">폰 카메라로 스캔한 뒤 로그인하면 체크인됩니다 · QR은 주기적으로 갱신됩니다</p>
      <Link href="/login" className="font-mono text-[10px] text-silk-faint/60 hover:text-silk-faint">
        이 화면 전용 로그인(본인 이름 선택 방식 켜기)
      </Link>
    </div>
  );
}
