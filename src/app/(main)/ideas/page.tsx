import { FeedToolbar } from "@/components/ideas/FeedToolbar";
import { IdeaCard, type IdeaComment, type IdeaReaction } from "@/components/ideas/IdeaCard";
import { IdeaComposer } from "@/components/ideas/IdeaComposer";
import { IdeasSidebar } from "@/components/ideas/IdeasSidebar";

type Idea = {
  avatar: string;
  who: string;
  when: string;
  title: string;
  body: string;
  tags: string[];
  reactions: [IdeaReaction, IdeaReaction, IdeaReaction];
  commentLabel: string;
  comments?: IdeaComment[];
};

/**
 * playground-design/ideas.html의 .idea-card 3건 정적 데이터.
 * 원본 <script>가 이 데이터를 조작하지 않고 react-btn의 active 클래스만
 * 토글하므로 local constant로 유지한다(docs/MIGRATION.md 8절).
 */
const IDEAS: Idea[] = [
  {
    avatar: "지",
    who: "오지훈",
    when: "8월 29일 (금) · 14:20",
    title: "GoldenLink에 실시간 병상 현황 공유 기능 추가하면 어떨까요",
    body: "응급환자 매칭할 때 병원 쪽에서 병상 여유를 직접 업데이트할 수 있게 하면 매칭 정확도가 올라갈 것 같아요. 처음엔 수동 입력으로 시작하고, 나중에 병원 시스템 API 연동까지 확장하면 좋을 듯합니다. AI Rookie 본선 심사 때도 어필 포인트가 될 것 같고요.",
    tags: ["GoldenLink", "AI Rookie"],
    reactions: [
      { count: 12, active: true },
      { count: 5, active: false },
      { count: 3, active: false },
    ],
    commentLabel: "댓글 3",
    comments: [
      {
        avatar: "연",
        who: "김연구",
        text: "병원 쪽 부담이 클 수 있어서 처음엔 저희가 공공데이터포털 응급실 정보 API로 자동 갱신하는 것도 방법일 것 같아요.",
      },
      {
        avatar: "민",
        who: "정민재",
        text: "공공데이터 API 응답 속도가 느린 편이던데, 캐싱 구조 같이 설계해봐야겠네요.",
      },
    ],
  },
  {
    avatar: "하",
    who: "이하늘",
    when: "8월 28일 (목) · 21:05",
    title: "SOC 논문에 온도별 오차 히트맵 시각화 넣기",
    body: "온도 구간별 SOC 추정 오차를 표로만 보여주는 것보다 히트맵으로 시각화하면 리뷰어들이 한눈에 파악하기 쉬울 것 같아요. matplotlib이나 seaborn으로 초안 한번 만들어볼게요.",
    tags: ["SOC 논문", "시각화"],
    reactions: [
      { count: 7, active: false },
      { count: 4, active: true },
      { count: 2, active: false },
    ],
    commentLabel: "댓글 1",
    comments: [
      {
        avatar: "준",
        who: "박준서",
        text: "좋은데요, 완성되면 저희 IDEC 색상 식별기 오차 분석에도 같은 방식 써보고 싶어요.",
      },
    ],
  },
  {
    avatar: "태",
    who: "강태윤",
    when: "8월 26일 (화) · 11:40",
    title: "투자자 미팅용 원페이저 템플릿 만들어두면 어떨까요",
    body: "미팅 잡힐 때마다 자료 새로 만드는 게 비효율적인 것 같아서, 회사소개 페이지 내용 기반으로 PDF 원페이저 템플릿을 하나 만들어두고 미팅 성격에 따라 조금씩만 수정해서 쓰면 어떨까 싶어요.",
    tags: ["투자유치", "자료"],
    reactions: [
      { count: 9, active: false },
      { count: 2, active: false },
      { count: 6, active: false },
    ],
    commentLabel: "댓글 0",
  },
];

export default function IdeasPage() {
  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">아이디어 모음집</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">아이디어 모음집</h1>
        </div>
        <button
          type="button"
          className="inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
        >
          + 아이디어 작성
        </button>
      </div>

      <div className="mx-auto grid max-w-[1220px] grid-cols-[1fr_300px] items-start gap-[22px] px-7 pt-[22px] pb-[90px] max-[960px]:grid-cols-1">
        <div>
          <IdeaComposer />
          <FeedToolbar />
          {IDEAS.map((idea) => (
            <IdeaCard key={idea.who} {...idea} />
          ))}
        </div>
        <IdeasSidebar />
      </div>
    </>
  );
}
