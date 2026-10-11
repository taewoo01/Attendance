import { and, asc, desc, eq, max } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { profiles, projects, taskAssignees, tasks, type TaskStatus } from "@/db/schema";

/**
 * projects/tasks/task_assignees Repository. 이 모듈은 서버 전용(src/lib/db/client.ts
 * 의존)이다. 팀 전체가 모든 프로젝트를 보는 구조라 조회에 사용자 필터를 두지 않는다
 * (RLS도 SELECT 전체 허용 — drizzle/0058).
 */
export async function listProjects() {
  return db
    .select({
      id: projects.id,
      name: projects.name,
      description: projects.description,
      createdBy: projects.createdBy,
      createdAt: projects.createdAt,
    })
    .from(projects)
    .orderBy(desc(projects.createdAt));
}

export async function getProjectById(id: string) {
  const [row] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  return row ?? null;
}

/** 프로젝트의 업무 전체. 같은 status 열 안에서는 position → 생성 순으로 정렬한다. */
export async function listTasksForProject(projectId: string) {
  return db
    .select({
      id: tasks.id,
      projectId: tasks.projectId,
      title: tasks.title,
      description: tasks.description,
      status: tasks.status,
      dueDate: tasks.dueDate,
      position: tasks.position,
      createdBy: tasks.createdBy,
      createdAt: tasks.createdAt,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .orderBy(asc(tasks.position), asc(tasks.createdAt));
}

export async function getTaskById(id: string) {
  const [row] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return row ?? null;
}

/**
 * 전체 task_assignees에 이름을 붙여서 돌려준다. 화면이 업무별로 묶어 카드에
 * 담당자 이름을 보여주는 용도라 profiles를 left join한다(idea_reactions와 동일 패턴).
 */
export async function listTaskAssignees() {
  return db
    .select({
      taskId: taskAssignees.taskId,
      userId: taskAssignees.userId,
      name: profiles.name,
    })
    .from(taskAssignees)
    .leftJoin(profiles, eq(taskAssignees.userId, profiles.userId));
}

/** 담당자 변경 diff와 "작성자 또는 담당자" 권한 확인용 — 특정 업무의 담당자 user_id 목록. */
export async function listAssigneeIdsForTask(taskId: string): Promise<string[]> {
  const rows = await db
    .select({ userId: taskAssignees.userId })
    .from(taskAssignees)
    .where(eq(taskAssignees.taskId, taskId));
  return rows.map((r) => r.userId);
}

/**
 * 새 카드/이동한 카드를 열의 맨 아래에 놓기 위한 다음 position. 같은 프로젝트의
 * 같은 status 열만 본다 — 열이 비어 있으면 0.
 */
export async function nextPositionInColumn(projectId: string, status: TaskStatus): Promise<number> {
  const [row] = await db
    .select({ maxPosition: max(tasks.position) })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.status, status)));
  return (row?.maxPosition ?? -1) + 1;
}
