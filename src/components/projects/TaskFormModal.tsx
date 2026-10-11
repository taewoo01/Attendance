"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createTask, setTaskAssignees, updateTask } from "@/lib/tasks/actions";
import type { MemberOption, TaskCardData } from "@/components/projects/ProjectsBoard";

const INPUT_CLASS =
  "w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none";
const LABEL_CLASS = "m-0 mb-2 font-mono text-[11.5px] tracking-[0.1em] text-silk-faint";

type TaskFormModalProps = {
  projectId: string;
  members: MemberOption[];
  /** 있으면 수정 모드, 없으면 새 업무 등록. */
  task?: TaskCardData;
  /** 담당자 변경은 업무 작성자만 가능하다(서버도 동일하게 검증). 새 업무는 항상 true. */
  canEditAssignees: boolean;
  onClose: () => void;
};

/**
 * 업무 등록/수정 모달. 담당자는 팀원 체크박스 다중 선택이다. 수정 시 제목/설명/마감일은
 * updateTask, 담당자 변경은 setTaskAssignees로 서버에 분리되어 있어(권한이 다름) 순서대로
 * 호출한다. 부모가 열릴 때만 마운트하므로(조건부 렌더링) 닫힐 때 state를 따로 초기화하지 않는다.
 */
export function TaskFormModal({ projectId, members, task, canEditAssignees, onClose }: TaskFormModalProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(task?.assignees.map((a) => a.userId) ?? []);

  function toggleAssignee(userId: string) {
    setAssigneeIds((prev) => (prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    for (const id of assigneeIds) formData.append("assigneeIds", id);

    let result;
    if (task) {
      formData.set("taskId", task.id);
      result = await updateTask(formData);
      if (!result.error && canEditAssignees) {
        result = await setTaskAssignees(task.id, formData);
      }
    } else {
      formData.set("projectId", projectId);
      result = await createTask(formData);
    }

    setPending(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[rgba(4,10,8,0.65)] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-h-[88vh] w-full max-w-[560px] overflow-y-auto rounded-card border border-border bg-bg-panel">
        <div className="flex items-center justify-between border-b border-border px-[22px] py-[18px]">
          <h3 className="m-0 text-[14.5px] font-semibold">{task ? "업무 수정" : "업무 추가"}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="cursor-pointer border-none bg-transparent px-1 py-0.5 text-xl leading-none text-silk-faint hover:text-silk"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-[22px] pt-5 pb-[22px]">
            <div className="mb-[18px]">
              <p className={LABEL_CLASS}>제목</p>
              <input name="title" type="text" required defaultValue={task?.title ?? ""} className={INPUT_CLASS} />
            </div>

            <div className="mb-[18px]">
              <p className={LABEL_CLASS}>설명 (선택)</p>
              <textarea
                name="description"
                defaultValue={task?.description ?? ""}
                className={`${INPUT_CLASS} min-h-[100px] resize-y leading-[1.6]`}
              />
            </div>

            <div className="mb-[18px]">
              <p className={LABEL_CLASS}>마감일 (선택)</p>
              <input name="dueDate" type="date" defaultValue={task?.dueDate ?? ""} className={INPUT_CLASS} />
            </div>

            {canEditAssignees && (
              <div className="mb-[18px]">
                <p className={LABEL_CLASS}>담당자 (여러 명 선택 가능)</p>
                <div className="flex flex-wrap gap-2">
                  {members.map((member) => {
                    const active = assigneeIds.includes(member.userId);
                    return (
                      <button
                        key={member.userId}
                        type="button"
                        onClick={() => toggleAssignee(member.userId)}
                        aria-pressed={active}
                        className={`cursor-pointer rounded-button border px-3 py-1.5 font-mono text-[12px] font-semibold ${
                          active
                            ? "border-teal bg-teal text-[#04231b]"
                            : "border-border bg-transparent text-silk-faint hover:text-silk"
                        }`}
                      >
                        {member.name || "이름 없음"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {error && <p className="m-0 font-mono text-[11px] text-[#e2543f]">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-border px-[22px] py-[14px]">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={pending}
              className="inline-flex cursor-pointer items-center justify-center rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "저장 중..." : task ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
