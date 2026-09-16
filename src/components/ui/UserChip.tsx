/**
 * playground-design/ 공통 `.user-chip` 구조를 그대로 옮김.
 * 실제 인증 프로필 데이터는 연결하지 않고(TASK-018 범위), 표시할 이름/이니셜만
 * props로 받는다. 기본값은 원본 mockup(김연구/연)과 동일하게 두어 시각적으로
 * 동일하게 렌더링되게 한다.
 * 로그아웃은 이 칩이 아니라 옆에 별도 아이콘 버튼(StatusBar의 LogoutButton)으로
 * 분리했다. 이 컴포넌트는 이름 표시 전용이라 클릭 인터랙션을 갖지 않는다.
 * 상단바 프로필 사진 반영: `avatarUrl`이 있으면(호출부가 profiles.avatarPath로
 * 발급한 signed URL) 이니셜 원형 대신 실제 사진을 보여준다. TeamGrid와 동일한
 * 폴백 규칙 — 값이 없으면 기존 이니셜 아바타 그대로.
 */
type UserChipProps = {
  name?: string;
  initial?: string;
  avatarUrl?: string | null;
};

export function UserChip({ name = "김연구", initial = "연", avatarUrl }: UserChipProps) {
  return (
    <div className="flex items-center gap-2 font-medium text-silk">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- signed URL은 만료가 있어 next/image 원격 최적화 대상으로 등록하기보다 그대로 <img>로 둔다.
        <img
          src={avatarUrl}
          alt=""
          className="h-[26px] w-[26px] rounded-full object-cover"
        />
      ) : (
        <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[linear-gradient(155deg,var(--teal),#157a5f)] text-[11px] font-bold text-[#04231b]">
          {initial}
        </span>
      )}
      {name}
    </div>
  );
}
