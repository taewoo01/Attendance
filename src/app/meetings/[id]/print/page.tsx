import { notFound } from "next/navigation";
import { MeetingPrintTrigger } from "@/components/meetings/MeetingPrintTrigger";
import { getMeetingById } from "@/lib/db/meetings";

// 목록/상세 페이지와 동일하게 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 회의록 인쇄 전용 페이지. `(main)` route group 밖에 둬서 StatusBar/사이드바/
 * 다른 회의록 카드 같은 화면 요소를 아예 렌더링하지 않는다(어두운 테마 배경도
 * 상속하지 않는다) — MeetingCard.tsx의 "인쇄" 버튼이 이 경로를 새 탭으로 연다.
 * 열리자마자 MeetingPrintTrigger가 자동으로 window.print()를 호출한다.
 */
export default async function MeetingPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!UUID_RE.test(id)) {
    notFound();
  }

  const meeting = await getMeetingById(id);
  if (!meeting) {
    notFound();
  }

  return (
    <div className="mx-auto min-h-screen max-w-[720px] bg-white px-10 py-12 text-[#141a18] print:px-0 print:py-0">
      <MeetingPrintTrigger />

      <p className="m-0 font-mono text-[11px] tracking-[0.1em] text-[#6b7a75]">PLAY GROUND · 회의록</p>
      <h1 className="m-0 mt-2 text-[22px] font-bold text-[#0b1e19]">{meeting.title}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2 font-mono text-[12px] text-[#4a5854]">
        <span>{meeting.meetingDate}</span>
        <span>·</span>
        <span>{meeting.place}</span>
        {meeting.presenter && (
          <>
            <span>·</span>
            <span>발표: {meeting.presenter}</span>
          </>
        )}
      </div>

      {meeting.attendees.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {meeting.attendees.map((attendee, i) => (
            <span
              key={i}
              className="rounded-[999px] border border-[#c9d2ce] px-2 py-[3px] font-mono text-[10.5px] font-bold text-[#0b1e19]"
            >
              {attendee}
            </span>
          ))}
        </div>
      )}

      <hr className="my-5 border-t border-[#dde3e0]" />

      {meeting.notesFormat === "rows" ? (
        <section className="mb-6">
          <h2 className="m-0 mb-2.5 font-mono text-[11px] tracking-[0.1em] text-[#6b7a75]">안건 · 결정 사항</h2>
          {meeting.agenda.map((item, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="relative pl-[14px] text-[13px] leading-[1.6] text-[#141a18] before:absolute before:left-0 before:content-['—'] before:text-[#8a978f]">
                {item}
              </div>
              {meeting.decisions[i] && (
                <div className="mt-1.5 border-l-[3px] border-[#0b8a63] bg-[#eef7f3] px-[13px] py-2.5 text-[13px] leading-[1.6] text-[#0b1e19]">
                  {meeting.decisions[i]}
                </div>
              )}
            </div>
          ))}
        </section>
      ) : meeting.notesFormat === "text" ? (
        <>
          <section className="mb-6">
            <h2 className="m-0 mb-2.5 font-mono text-[11px] tracking-[0.1em] text-[#6b7a75]">안건</h2>
            {meeting.agenda[0] && (
              <p className="m-0 whitespace-pre-wrap text-[13px] leading-[1.6] text-[#141a18]">{meeting.agenda[0]}</p>
            )}
          </section>
          <section className="mb-6">
            <h2 className="m-0 mb-2.5 font-mono text-[11px] tracking-[0.1em] text-[#6b7a75]">결정 사항</h2>
            {meeting.decisions[0] && (
              <div className="whitespace-pre-wrap border-l-[3px] border-[#0b8a63] bg-[#eef7f3] px-[13px] py-2.5 text-[13px] leading-[1.6] text-[#0b1e19]">
                {meeting.decisions[0]}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="mb-6">
            <h2 className="m-0 mb-2.5 font-mono text-[11px] tracking-[0.1em] text-[#6b7a75]">안건</h2>
            <ul className="m-0 list-none p-0">
              {meeting.agenda.map((item, i) => (
                <li
                  key={i}
                  className="relative mb-1.5 pl-[14px] text-[13px] leading-[1.6] text-[#141a18] last:mb-0 before:absolute before:left-0 before:content-['—'] before:text-[#8a978f]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section className="mb-6">
            <h2 className="m-0 mb-2.5 font-mono text-[11px] tracking-[0.1em] text-[#6b7a75]">결정 사항</h2>
            {meeting.decisions.map((decision, i) => (
              <div
                key={i}
                className="mb-1.5 border-l-[3px] border-[#0b8a63] bg-[#eef7f3] px-[13px] py-2.5 text-[13px] leading-[1.6] text-[#0b1e19] last:mb-0"
              >
                {decision}
              </div>
            ))}
          </section>
        </>
      )}

      <section>
        <h2 className="m-0 mb-2.5 font-mono text-[11px] tracking-[0.1em] text-[#6b7a75]">할 일</h2>
        {meeting.actions.length === 0 ? (
          <p className="m-0 text-[12.5px] text-[#8a978f]">등록된 할 일이 없습니다.</p>
        ) : (
          meeting.actions.map((action, i) => (
            <div
              key={i}
              className="grid grid-cols-[16px_1fr_auto_auto] items-center gap-3 border-b border-[#dde3e0] py-2 last:border-b-0"
            >
              <span className="text-[12px]">{action.done ? "☑" : "☐"}</span>
              <span className={`text-[12.8px] ${action.done ? "text-[#8a978f] line-through" : "text-[#141a18]"}`}>
                {action.text}
              </span>
              <span className="whitespace-nowrap font-mono text-[11px] text-[#4a5854]">{action.who}</span>
              <span className="whitespace-nowrap font-mono text-[11px] text-[#4a5854]">{action.due}</span>
            </div>
          ))
        )}
      </section>

      <div className="mt-8 flex items-center justify-between border-t border-[#dde3e0] pt-3 font-mono text-[11px] text-[#8a978f]">
        <span>{meeting.tag}</span>
        <span>기록: {meeting.recorder}</span>
      </div>
    </div>
  );
}
