import Link from "next/link";
import type { CheckInResult } from "@/lib/attendance/actions";

const MESSAGE: Record<CheckInResult, string> = {
  ok: "체크인 완료되었습니다.",
  already: "오늘 이미 체크인했습니다.",
  invalid_token: "QR이 만료됐어요. 화면의 QR을 다시 스캔해 주세요.",
  unauthenticated: "로그인 후 다시 QR을 스캔해 주세요.",
};

const CHECKIN_RESULTS = Object.keys(MESSAGE) as CheckInResult[];

/**
 * QR 스캔(/attendance/checkin) 착지 후 보여주는 결과 화면. (main) 밖에 둬서
 * StatusBar/Footer 없이 결과만 보여준다.
 * 예전에는 /attendance?checkin=...로 리다이렉트했는데, /attendance는 로그인이
 * 필요한 페이지라 "개인 QR"(로그인 없이 체크인되는 토큰)을 로그인 안 된 폰으로
 * 스캔하면 체크인 자체는 이미 성공했는데도 화면엔 로그인 화면이 뜨는 문제가
 * 있었다 — 체크인 결과 확인에는 로그인이 필요 없는 이 페이지로 대신 보낸다.
 */
export default async function CheckinResultPage({
  searchParams,
}: {
  searchParams: Promise<{ checkin?: string }>;
}) {
  const { checkin } = await searchParams;
  const result = CHECKIN_RESULTS.includes(checkin as CheckInResult) ? (checkin as CheckInResult) : null;
  const isSuccess = result === "ok" || result === "already";

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-bg px-6 text-center text-silk">
      <p className={`text-lg font-semibold ${isSuccess ? "text-teal" : "text-silk"}`}>
        {result ? MESSAGE[result] : "체크인 결과를 확인할 수 없습니다."}
      </p>
      <Link href="/attendance" className="font-mono text-xs text-silk-faint underline hover:text-silk">
        출석 현황 보러가기
      </Link>
    </div>
  );
}
