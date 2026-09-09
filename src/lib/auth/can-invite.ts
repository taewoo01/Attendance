import { getProfileByUserId } from "@/lib/db/profiles";

/**
 * profiles.can_invite 조회 helper.
 * profiles 행이 없으면(트리거가 아직 안 만들었거나 데이터 이상) fail closed로 false.
 * can_invite는 오직 팀원 초대 가능 여부만 의미하며, 다른 기능 권한과 연결하지 않는다.
 */
export async function getCanInvite(userId: string): Promise<boolean> {
  const profile = await getProfileByUserId(userId);
  return profile?.canInvite ?? false;
}
