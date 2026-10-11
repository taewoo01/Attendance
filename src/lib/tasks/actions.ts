"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { projects, taskAssignees, tasks, type TaskStatus } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth/get-user";
import { getProfileByUserId, listProfiles } from "@/lib/db/profiles";
import {
  getProjectById,
  getTaskById,
  listAssigneeIdsForTask,
  nextPositionInColumn,
} from "@/lib/db/tasks";
import { notifyUser, truncateForPreview } from "@/lib/notifications/create";

export type TaskActionState = { error?: string; success?: boolean };

const TASK_STATUSES: readonly TaskStatus[] = ["todo", "doing", "done"];
const DUE_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PROJECTS_PATH = "/projects";

function isTaskStatus(value: string): value is TaskStatus {
  return (TASK_STATUSES as readonly string[]).includes(value);
}

/** 빈 문자열은 "마감일 없음"(null)이고, 값이 있으면 실제 존재하는 날짜여야 한다. */
function parseDueDate(raw: FormDataEntryValue | null): { value: string | null } | { error: string } {
  const text = String(raw ?? "").trim();
  if (!text) return { value: null };
  const parsed = new Date(`${text}T00:00:00Z`);
  if (!DUE_DATE_PATTERN.test(text) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text) {
    return { error: "마감일 형식이 올바르지 않습니다." };
  }
  return { value: text };
}

/** 중복을 제거한 담당자 id 목록. 팀원(profiles)이 아닌 id가 섞여 있으면 에러다. */
async function parseAssigneeIds(formData: FormData): Promise<{ ids: string[] } | { error: string }> {
  const requested = [...new Set(formData.getAll("assigneeIds").map((v) => String(v).trim()).filter(Boolean))];
  if (requested.length === 0) return { ids: [] };

  const roster = new Set((await listProfiles()).map((p) => p.userId));
  if (requested.some((id) => !roster.has(id))) {
    return { error: "팀원이 아닌 담당자가 포함되어 있습니다." };
  }
  return { ids: requested };
}

async function actorName(userId: string): Promise<string> {
  const profile = await getProfileByUserId(userId);
  return profile?.name?.trim() || "팀원";
}

/** 새로 배정된 담당자에게 알림을 보낸다. 본인이 본인에게 배정한 경우는 보내지 않는다. */
async function notifyAssigned(actorUserId: string, recipientIds: string[], taskTitle: string) {
  const targets = recipientIds.filter((id) => id !== actorUserId);
  if (targets.length === 0) return;

  const who = await actorName(actorUserId);
  await Promise.all(
    targets.map((userId) =>
      notifyUser(userId, {
        type: "task_assigned",
        actorUserId,
        actorName: who,
        message: `${who}님이 업무를 배정했습니다: ${truncateForPreview(taskTitle)}`,
        linkHref: PROJECTS_PATH,
      }),
    ),
  );
}

/** 수정/상태 이동은 작성자 또는 담당자만 할 수 있다(RLS가 쓰기를 막아두므로 서버가 검증한다). */
async function canEditTask(userId: string, task: { id: string; createdBy: string | null }): Promise<boolean> {
  if (task.createdBy === userId) return true;
  const assigneeIds = await listAssigneeIdsForTask(task.id);
  return assigneeIds.includes(userId);
}

export async function createProject(formData: FormData): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "프로젝트 이름을 입력해 주세요." };

  await db.insert(projects).values({
    name,
    description: String(formData.get("description") ?? "").trim(),
    createdBy: user.id,
  });

  revalidatePath(PROJECTS_PATH);
  return { success: true };
}

/** 프로젝트 삭제는 작성자만 가능하다. 업무/담당자는 FK cascade로 함께 삭제된다. */
export async function deleteProject(projectId: string): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const project = await getProjectById(projectId);
  if (!project) return { error: "프로젝트를 찾을 수 없습니다." };
  if (project.createdBy !== user.id) return { error: "프로젝트 작성자만 삭제할 수 있습니다." };

  await db.delete(projects).where(eq(projects.id, projectId));

  revalidatePath(PROJECTS_PATH);
  return { success: true };
}

export async function createTask(formData: FormData): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const projectId = String(formData.get("projectId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "업무 제목을 입력해 주세요." };

  const project = projectId ? await getProjectById(projectId) : null;
  if (!project) return { error: "프로젝트를 찾을 수 없습니다." };

  const due = parseDueDate(formData.get("dueDate"));
  if ("error" in due) return { error: due.error };

  const assignees = await parseAssigneeIds(formData);
  if ("error" in assignees) return { error: assignees.error };

  const position = await nextPositionInColumn(projectId, "todo");

  await db.transaction(async (tx) => {
    const [created] = await tx
      .insert(tasks)
      .values({
        projectId,
        title,
        description: String(formData.get("description") ?? "").trim(),
        status: "todo",
        dueDate: due.value,
        position,
        createdBy: user.id,
      })
      .returning({ id: tasks.id });

    if (assignees.ids.length > 0) {
      await tx.insert(taskAssignees).values(assignees.ids.map((userId) => ({ taskId: created.id, userId })));
    }
  });

  await notifyAssigned(user.id, assignees.ids, title);

  revalidatePath(PROJECTS_PATH);
  return { success: true };
}

/** 제목/설명/마감일 수정. 작성자 또는 담당자만 가능하다. 담당자 변경은 setTaskAssignees가 전담한다. */
export async function updateTask(formData: FormData): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const task = await getTaskById(String(formData.get("taskId") ?? "").trim());
  if (!task) return { error: "업무를 찾을 수 없습니다." };
  if (!(await canEditTask(user.id, task))) return { error: "작성자 또는 담당자만 수정할 수 있습니다." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "업무 제목을 입력해 주세요." };

  const due = parseDueDate(formData.get("dueDate"));
  if ("error" in due) return { error: due.error };

  await db
    .update(tasks)
    .set({
      title,
      description: String(formData.get("description") ?? "").trim(),
      dueDate: due.value,
      updatedAt: new Date(),
    })
    .where(eq(tasks.id, task.id));

  revalidatePath(PROJECTS_PATH);
  return { success: true };
}

/** 칸반 열 이동. 이동한 열의 맨 아래에 놓는다. 작성자 또는 담당자만 가능하다. */
export async function moveTask(taskId: string, status: string): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };
  if (!isTaskStatus(status)) return { error: "올바르지 않은 상태입니다." };

  const task = await getTaskById(taskId);
  if (!task) return { error: "업무를 찾을 수 없습니다." };
  if (!(await canEditTask(user.id, task))) return { error: "작성자 또는 담당자만 이동할 수 있습니다." };
  if (task.status === status) return { success: true };

  const position = await nextPositionInColumn(task.projectId, status);
  await db.update(tasks).set({ status, position, updatedAt: new Date() }).where(eq(tasks.id, task.id));

  revalidatePath(PROJECTS_PATH);
  return { success: true };
}

/**
 * 담당자 목록을 통째로 교체한다(기존과의 diff로 추가/삭제). 담당자 변경은 업무 작성자만
 * 가능하다 — 담당자끼리 서로 빼고 넣는 걸 막기 위해서다. 새로 추가된 사람에게만 알림을 보낸다.
 */
export async function setTaskAssignees(taskId: string, formData: FormData): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const task = await getTaskById(taskId);
  if (!task) return { error: "업무를 찾을 수 없습니다." };
  if (task.createdBy !== user.id) return { error: "업무 작성자만 담당자를 변경할 수 있습니다." };

  const next = await parseAssigneeIds(formData);
  if ("error" in next) return { error: next.error };

  const current = await listAssigneeIdsForTask(task.id);
  const toAdd = next.ids.filter((id) => !current.includes(id));
  const toRemove = current.filter((id) => !next.ids.includes(id));

  await db.transaction(async (tx) => {
    if (toRemove.length > 0) {
      await tx
        .delete(taskAssignees)
        .where(and(eq(taskAssignees.taskId, task.id), inArray(taskAssignees.userId, toRemove)));
    }
    if (toAdd.length > 0) {
      await tx.insert(taskAssignees).values(toAdd.map((userId) => ({ taskId: task.id, userId })));
    }
  });

  await notifyAssigned(user.id, toAdd, task.title);

  revalidatePath(PROJECTS_PATH);
  return { success: true };
}

/** 업무 삭제는 작성자만 가능하다. 담당자 행은 FK cascade로 함께 삭제된다. */
export async function deleteTask(taskId: string): Promise<TaskActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "로그인이 필요합니다." };

  const task = await getTaskById(taskId);
  if (!task) return { error: "업무를 찾을 수 없습니다." };
  if (task.createdBy !== user.id) return { error: "업무 작성자만 삭제할 수 있습니다." };

  await db.delete(tasks).where(eq(tasks.id, task.id));

  revalidatePath(PROJECTS_PATH);
  return { success: true };
}
