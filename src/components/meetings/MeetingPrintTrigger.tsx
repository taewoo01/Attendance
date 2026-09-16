"use client";

import { useEffect } from "react";

/**
 * /meetings/[id]/print 페이지가 열리자마자 인쇄 대화상자를 자동으로 띄운다.
 * 브라우저가 자동 호출을 막거나 사용자가 인쇄창을 닫아버린 경우를 대비해
 * 화면에는 다시 누를 수 있는 "인쇄" 버튼도 같이 둔다(인쇄 결과에는 안 찍히도록
 * print:hidden).
 */
export function MeetingPrintTrigger() {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="print:hidden fixed top-4 right-4 cursor-pointer rounded-button border border-[#c9d2ce] bg-white px-4 py-2 text-[13px] font-semibold text-[#0b1e19] shadow-[0_4px_12px_rgba(0,0,0,0.12)] hover:border-[#48d9b0]"
    >
      인쇄
    </button>
  );
}
