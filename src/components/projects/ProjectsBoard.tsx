"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { TaskFormModal } from "@/components/projects/TaskFormModal";
import type { TaskStatus } from "@/db/schema";
import { seoulDateKey } from "@/lib/date";
import { createProject, deleteProject, deleteTask, moveTask } from "@/lib/tasks/actions";

export type MemberOption = { userId: string; name: string };
export type ProjectItem = { id: string; name: string; description: string; createdBy: string | null };
export type TaskCardData = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  createdBy: string | null;
  assignees: { userId: string; name: string }[];
};

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: "todo", label: "할 일" },
  { status: "doing", label: "진행 중" },
  { status: "done", label: "완료" },
];

const SMALL_BUTTON_CLASS =
  "cursor-pointer rounded-button border border-border bg-transparent px-2 py-1 font-mono text-[11px] font-semibold text-silk-faint hover:text-silk disabled:cursor-not-allowed disabled:opacity-50";
const INPUT_CLASS =
  "w-full rounded-input border border-border bg-bg-raised px-[14px] py-[11px] font-sans text-[13.5px] text-silk focus:border-teal-dim focus:outline-none";

/** "2026-09-18" → "9/18". 형식이 어긋난 값은 그대로 돌려줘 화면이 깨지지 않게 한다. */
function formatDue(dateKey: string): string {
  const [, month, day] = dateKey.split("-");
  if (!month || !day) return dateKey;
  return `${Number(month)}/${Number(day)}`;
}

type TaskCardProps = {
  task: TaskCardData;
  currentUserId: string | null;
  todayKey: string;
  onEdit: (task: TaskCardData) => void;
  onMove: (task: TaskCardData, status: TaskStatus) => void;
  onDelete: (task: TaskCardData) => void;
  busy: boolean;
};

function TaskCard({ task, currentUserId, todayKey, onEdit, onMove, onDelete, busy }: TaskCardProps) {
  const isCreator = currentUserId !== null && task.createdBy === currentUserId;
  const isAssignee = currentUserId !== null && task.assignees.some((a) => a.userId === currentUserId);
  const canEdit = isCreator || isAssignee;
  const index = COLUMNS.findIndex((c) => c.status === task.status);
  const prev = COLUMNS[index - 1];
  const next = COLUMNS[index + 1];
  const overdue = task.dueDate !== null && task.status !== "done" && task.dueDate < todayKey;

  return (
    <div className="mb-2.5 rounded-[10px] border border-border bg-bg-raised p-3 last:mb-0">
      <p className="m-0 text-[13.5px] font-semibold leading-[1.4]">{task.title}</p>
      {task.description && (
        <p className="m-0 mt-1.5 whitespace-pre-wrap text-[12px] leading-[1.5] text-silk-faint">{task.description}</p>
      )}

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        {task.assignees.length === 0 ? (
          <span className="font-mono text-[11px] text-silk-faint">담당자 없음</span>
        ) : (
          task.assignees.map((a) => (
            <span
              key={a.userId}
              className="rounded-full border border-border px-2 py-0.5 font-mono text-[11px] text-silk"
            >
              {a.name || "이름 없음"}
            </span>
          ))
        )}
        {task.dueDate && (
          <span className={`font-mono text-[11px] ${overdue ? "text-[#e2543f]" : "text-silk-faint"}`}>
            ~{formatDue(task.dueDate)}
            {overdue ? " 지연" : ""}
          </span>
        )}
      </div>

      {canEdit && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {prev && (
            <button type="button" disabled={busy} onClick={() => onMove(task, prev.status)} className={SMALL_BUTTON_CLASS}>
              ← {prev.label}
            </button>
          )}
          {next && (
            <button type="button" disabled={busy} onClick={() => onMove(task, next.status)} className={SMALL_BUTTON_CLASS}>
              {next.label} →
            </button>
          )}
          <button type="button" disabled={busy} onClick={() => onEdit(task)} className={SMALL_BUTTON_CLASS}>
            수정
          </button>
          {isCreator && (
            <button
              type="button"
              disabled={busy}
              onClick={() => onDelete(task)}
              className={`${SMALL_BUTTON_CLASS} hover:text-[#e2543f]`}
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
}

type ProjectsBoardProps = {
  projects: ProjectItem[];
  selectedProjectId: string | null;
  tasks: TaskCardData[];
  members: MemberOption[];
  currentUserId: string | null;
};

/**
 * 프로젝트/업무 관리 칸반. 3열(할 일/진행 중/완료) 고정이고 열 이동은 카드의 ←/→ 버튼으로
 * 한다(드래그는 이번 범위 밖 — 새 dependency 없이 서버 액션 moveTask만 호출). 모든 변경은
 * 서버 액션이 권한을 검증하므로 여기의 버튼 노출 조건(작성자/담당자)은 UX용일 뿐이다.
 * 프로젝트 선택은 ?project=<id> 쿼리라 링크로 공유할 수 있다.
 */
export function ProjectsBoard({ projects, selectedProjectId, tasks, members, currentUserId }: ProjectsBoardProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [taskModal, setTaskModal] = useState<{ task?: TaskCardData } | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId) ?? null;
  const todayKey = seoulDateKey(new Date());
  const isProjectOwner = currentUserId !== null && selectedProject?.createdBy === currentUserId;

  async function run(action: () => Promise<{ error?: string }>) {
    setBusy(true);
    setError(null);
    const result = await action();
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return false;
    }
    router.refresh();
    return true;
  }

  async function handleCreateProject(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    if (await run(() => createProject(formData))) {
      form.reset();
      setShowProjectForm(false);
    }
  }

  function handleDeleteProject() {
    if (!selectedProject) return;
    if (!window.confirm(`"${selectedProject.name}" 프로젝트와 모든 업무를 삭제할까요?`)) return;
    void run(() => deleteProject(selectedProject.id));
  }

  function handleDeleteTask(task: TaskCardData) {
    if (!window.confirm(`"${task.title}" 업무를 삭제할까요?`)) return;
    void run(() => deleteTask(task.id));
  }

  return (
    <>
      <div className="mx-auto flex max-w-[1220px] flex-wrap items-baseline justify-between gap-[10px] px-7 pt-[30px]">
        <div>
          <p className="font-mono text-xs text-silk-faint">
            PLAY GROUND / <span className="text-teal">프로젝트</span>
          </p>
          <h1 className="m-0 mt-1.5 text-[26px] font-semibold">프로젝트 · 업무 관리</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowProjectForm((v) => !v)}
            className="inline-flex cursor-pointer items-center justify-center rounded-button border border-border bg-transparent px-4 py-2.5 text-[13px] font-semibold text-silk"
          >
            + 프로젝트
          </button>
          {selectedProject && (
            <button
              type="button"
              onClick={() => setTaskModal({})}
              className="inline-flex cursor-pointer items-center justify-center rounded-button border border-teal bg-teal px-4 py-2.5 text-[13px] font-semibold text-[#04231b]"
            >
              + 업무 추가
            </button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-[1220px] px-7 pt-5 pb-[90px]">
        {showProjectForm && (
          <form
            onSubmit={handleCreateProject}
            className="mb-5 grid gap-3 rounded-panel border border-border bg-bg-panel p-[18px]"
          >
            <input name="name" type="text" required placeholder="프로젝트 이름" className={INPUT_CLASS} />
            <input name="description" type="text" placeholder="설명 (선택)" className={INPUT_CLASS} />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowProjectForm(false)}
                className="cursor-pointer rounded-button border border-border bg-transparent px-3 py-[7px] text-xs font-semibold text-silk"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={busy}
                className="cursor-pointer rounded-button border border-teal bg-teal px-3 py-[7px] text-xs font-semibold text-[#04231b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                만들기
              </button>
            </div>
          </form>
        )}

        {error && <p className="m-0 mb-4 font-mono text-[12px] text-[#e2543f]">{error}</p>}

        {projects.length === 0 ? (
          <p className="m-0 rounded-panel border border-border bg-bg-panel p-6 text-center font-mono text-[13px] text-silk-faint">
            아직 프로젝트가 없습니다. “+ 프로젝트”로 첫 프로젝트를 만들어 보세요.
          </p>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {projects.map((project) => {
                const active = project.id === selectedProjectId;
                return (
                  <Link
                    key={project.id}
                    href={`/projects?project=${project.id}`}
                    className={`rounded-button border px-3 py-1.5 font-mono text-[12.5px] font-semibold ${
                      active
                        ? "border-teal bg-teal text-[#04231b]"
                        : "border-border text-silk-faint hover:text-silk"
                    }`}
                  >
                    {project.name}
                  </Link>
                );
              })}
            </div>

            {selectedProject && (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="m-0 text-[13px] text-silk-faint">{selectedProject.description || "설명이 없습니다."}</p>
                {isProjectOwner && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleDeleteProject}
                    className={`${SMALL_BUTTON_CLASS} hover:text-[#e2543f]`}
                  >
                    프로젝트 삭제
                  </button>
                )}
              </div>
            )}

            <div className="grid grid-cols-3 items-start gap-4 max-[960px]:grid-cols-1">
              {COLUMNS.map((column) => {
                const columnTasks = tasks.filter((t) => t.status === column.status);
                return (
                  <section key={column.status} className="rounded-panel border border-border bg-bg-panel p-3.5">
                    <h2 className="m-0 mb-3 flex items-center justify-between text-[13.5px] font-semibold">
                      {column.label}
                      <span className="font-mono text-[12px] text-silk-faint">{columnTasks.length}</span>
                    </h2>
                    {columnTasks.length === 0 ? (
                      <p className="m-0 font-mono text-[12px] text-silk-faint">업무가 없습니다.</p>
                    ) : (
                      columnTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          currentUserId={currentUserId}
                          todayKey={todayKey}
                          busy={busy}
                          onEdit={(t) => setTaskModal({ task: t })}
                          onMove={(t, status) => void run(() => moveTask(t.id, status))}
                          onDelete={handleDeleteTask}
                        />
                      ))
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}
      </div>

      {taskModal && selectedProject && (
        <TaskFormModal
          projectId={selectedProject.id}
          members={members}
          task={taskModal.task}
          canEditAssignees={!taskModal.task || taskModal.task.createdBy === currentUserId}
          onClose={() => setTaskModal(null)}
        />
      )}
    </>
  );
}
