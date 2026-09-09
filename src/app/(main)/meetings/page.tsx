import { MeetingsBoard } from "@/components/meetings/MeetingsBoard";
import { MeetingsSidebar } from "@/components/meetings/MeetingsSidebar";
import { RegisterMeetingModal } from "@/components/meetings/RegisterMeetingModal";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listMeetings } from "@/lib/db/meetings";
import { getProfileByUserId } from "@/lib/db/profiles";

// TASK-023: DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

export default async function MeetingsPage() {
  const [meetings, user] = await Promise.all([listMeetings(), getCurrentUser()]);
  const myProfile = user ? await getProfileByUserId(user.id) : null;

  return (
    <>
      <RegisterMeetingModal defaultRecorder={myProfile?.name ?? ""} />
      <MeetingsBoard meetings={meetings} sidebar={<MeetingsSidebar meetings={meetings} />} />
    </>
  );
}
