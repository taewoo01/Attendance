import { MeetingsBoard } from "@/components/meetings/MeetingsBoard";
import { MeetingsSidebar } from "@/components/meetings/MeetingsSidebar";
import { type RecordingItem } from "@/components/meetings/RecordingsCard";
import { RegisterMeetingModal } from "@/components/meetings/RegisterMeetingModal";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listMeetingRecordings, listMeetings, withRecordingUrls } from "@/lib/db/meetings";
import { getProfileByUserId } from "@/lib/db/profiles";

// TASK-023: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

/** "9/15 14:32"(Asia/Seoul) — 녹음 카드에 등록 시각을 보여줄 때 쓴다. */
function formatSeoulDateTime(date: Date): string {
  const datePart = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", month: "numeric", day: "numeric" }).format(date);
  const timePart = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${datePart} ${timePart}`;
}

function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default async function MeetingsPage() {
  const [meetings, user, recordingRows] = await Promise.all([listMeetings(), getCurrentUser(), listMeetingRecordings()]);
  const myProfile = user ? await getProfileByUserId(user.id) : null;

  const recordingsWithUrls = await withRecordingUrls(recordingRows);
  const recordings: RecordingItem[] = recordingsWithUrls.map((row) => ({
    id: row.id,
    name: row.name,
    url: row.url,
    createdLabel: formatSeoulDateTime(row.createdAt),
    durationLabel: formatDuration(row.durationSeconds),
    isOwner: row.userId === user?.id,
  }));

  return (
    <>
      <RegisterMeetingModal defaultRecorder={myProfile?.name ?? ""} />
      <MeetingsBoard
        meetings={meetings}
        sidebar={<MeetingsSidebar meetings={meetings} myName={myProfile?.name} recordings={recordings} />}
      />
    </>
  );
}
