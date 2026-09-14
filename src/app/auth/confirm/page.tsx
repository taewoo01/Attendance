import { ConfirmAccountForm } from "@/components/auth/ConfirmAccountForm";

const ALLOWED_TYPES = new Set(["invite", "recovery"]);

/**
 * 초대 수락(invite) / 비밀번호 재설정(recovery) 이메일 링크의 착지 페이지.
 * 메일 보안 스캐너가 링크를 미리 방문해 1회용 토큰을 소모해버리는 문제(실제로
 * 재현·확인됨)를 막기 위해, 여기서는 verifyOtp()를 바로 실행하지 않고 버튼을
 * 보여주기만 한다 — 실제 인증은 ConfirmAccountForm이 사람이 버튼을 눌렀을 때만
 * Server Action(confirmAuthToken)으로 실행한다.
 * token_hash/type이 없거나 invite/recovery가 아니면 fail closed로 에러만 보여준다
 * (다른 목적의 verifyOtp 호출로 오용되지 않도록 제한).
 */
export default async function AuthConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type } = await searchParams;
  const valid = !!tokenHash && !!type && ALLOWED_TYPES.has(type);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      {valid ? (
        <ConfirmAccountForm tokenHash={tokenHash} type={type} />
      ) : (
        <div className="w-full max-w-[380px] rounded-card border border-border bg-bg-panel px-[26px] py-[30px] text-center">
          <h1 className="m-0 mb-3 text-[20px] font-semibold text-silk">잘못된 링크입니다</h1>
          <p className="m-0 text-[13px] leading-[1.6] text-silk-dim">
            이메일의 링크가 올바르지 않거나 만료되었습니다. 다시 요청해 주세요.
          </p>
        </div>
      )}
    </div>
  );
}
