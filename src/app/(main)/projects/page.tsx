import { ProjectsBoard, type TaskCardData } from "@/components/projects/ProjectsBoard";
import { TableRealtimeRefresh } from "@/components/realtime/TableRealtimeRefresh";
import { getCurrentUser } from "@/lib/auth/get-user";
import { listProfiles } from "@/lib/db/profiles";
import { listProjects, listTaskAssignees, listTasksForProject } from "@/lib/db/tasks";

// DB 조회가 build 시점에 고정되지 않도록 매 요청마다 렌더링한다.
export const dynamic = "force-dynamic";

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  const { project } = await searchParams;
  const requestedProjectId = typeof project === "string" ? project : null;

  const [projects, user, profiles] = await Promise.all([listProjects(), getCurrentUser(), listProfiles()]);

  // ?project가 없거나 존재하지 않는 id면 가장 최근 프로젝트를 보여준다.
  const selected = projects.find((p) => p.id === requestedProjectId) ?? projects[0] ?? null;

  const [taskRows, assigneeRows] = selected
    ? await Promise.all([listTasksForProject(selected.id), listTaskAssignees()])
    : [[], []];

  const tasks: TaskCardData[] = taskRows.map((row) => ({
    id: row.id,
    projectId: row.projectId,
    title: row.title,
    description: row.description,
    status: row.status,
    dueDate: row.dueDate,
    createdBy: row.createdBy,
    assignees: assigneeRows
      .filter((a) => a.taskId === row.id)
      .map((a) => ({ userId: a.userId, name: a.name ?? "" })),
  }));

  return (
    <>
      <TableRealtimeRefresh channel="projects-changes" tables={["projects", "tasks", "task_assignees"]} event="*" />
      <ProjectsBoard
        projects={projects.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          createdBy: p.createdBy,
        }))}
        selectedProjectId={selected?.id ?? null}
        tasks={tasks}
        members={profiles.map((p) => ({ userId: p.userId, name: p.name }))}
        currentUserId={user?.id ?? null}
      />
    </>
  );
}
