import type { LinkItem } from "@/db/schema";

/**
 * "use server" 파일(ideas/actions.ts, results/actions.ts)은 async 함수만
 * export할 수 있어서(upload-shared.ts/plan-shared.ts와 동일한 이유) 클라이언트
 * 컴포넌트(IdeaComposer/EditIdeaModal/RegisterResultModal/EditResultModal)와
 * 서버 액션이 함께 쓰는 상수/파싱 로직은 이 일반 모듈로 뺀다. 아이디어/실적
 * 양쪽이 "이름(선택) + URL" 링크 입력을 동일한 컨벤션으로 쓰므로 하나로 공유한다.
 */
export const LINK_NAME_MAX_LENGTH = 40;

/**
 * 링크 입력 폼이 보내는 `linkNames`/`linkUrls` 두 병렬 배열을 LinkItem[]로 합친다.
 * 각 행이 항상 이름+URL 입력을 함께 렌더링하므로 두 배열의 길이/순서가 맞는다고
 * 가정한다. URL이 빈 칸인 행은(이름만 입력하고 URL을 안 채운 경우 포함) 버린다.
 */
export function parseLinkPairs(formData: FormData): LinkItem[] {
  const names = formData.getAll("linkNames").map((v) => String(v).trim());
  const urls = formData.getAll("linkUrls").map((v) => String(v).trim());

  const links: LinkItem[] = [];
  for (let i = 0; i < urls.length; i++) {
    if (!urls[i]) continue;
    links.push({ name: names[i]?.slice(0, LINK_NAME_MAX_LENGTH) ?? "", url: urls[i] });
  }
  return links;
}

/** <a href>로 그대로 렌더링되므로 javascript:/data: 같은 스킴을 막아야 한다. */
export function hasInvalidLinkUrl(links: LinkItem[]): boolean {
  return links.some((l) => !/^https?:\/\//i.test(l.url));
}
