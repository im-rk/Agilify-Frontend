import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { DndContext, PointerSensor, useSensor, useSensors, closestCorners } from '@dnd-kit/core';
import { Rocket } from 'lucide-react';
import { useActiveBoard, useMoveIssue } from '@/hooks/useBoard';
import { BoardColumn } from '@/components/board/BoardColumn';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Mirrors the seeded workflow_config transitions exactly (see docs/WORKFLOW_GUARD.md):
// BACKLOG<->TODO, TODO<->IN_PROGRESS, IN_PROGRESS<->IN_REVIEW, IN_REVIEW->DONE, DONE->TODO.
// A generic 3-column Backlog/In Progress/Done board would let you drag straight from
// Backlog to Done, which the backend would reject with a 422 — so every real state gets
// its own column instead, and every drag the board allows is one the API will accept.
const COLUMNS = [
  { id: 'BACKLOG', title: 'Backlog' },
  { id: 'TODO', title: 'To do' },
  { id: 'IN_PROGRESS', title: 'In progress' },
  { id: 'IN_REVIEW', title: 'In review' },
  { id: 'DONE', title: 'Done' },
];

export default function BoardPage() {
  const { key } = useParams();
  const { data: board, isLoading, isError } = useActiveBoard(key);
  const moveIssue = useMoveIssue(key);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const columns = useMemo(() => {
    const grouped = Object.fromEntries(COLUMNS.map((c) => [c.id, []]));
    for (const issue of board?.issues ?? []) {
      (grouped[issue.status] ?? grouped.BACKLOG).push(issue);
    }
    for (const list of Object.values(grouped)) {
      list.sort((a, b) => (a.boardPosition ?? 0) - (b.boardPosition ?? 0));
    }
    return grouped;
  }, [board]);

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over) return;

    const sourceIssue = board.issues.find((i) => i.id === active.id);
    if (!sourceIssue) return;

    const targetColumnId = COLUMNS.some((c) => c.id === over.id)
      ? over.id
      : board.issues.find((i) => i.id === over.id)?.status;
    if (!targetColumnId) return;

    const targetList = columns[targetColumnId];
    const overIndex = targetList.findIndex((i) => i.id === over.id);
    const newPosition = overIndex === -1 ? targetList.length : overIndex;

    if (targetColumnId === sourceIssue.status && newPosition === sourceIssue.boardPosition) return;

    moveIssue.mutate({
      issueId: sourceIssue.id,
      position: newPosition,
      ...(targetColumnId !== sourceIssue.status ? { status: targetColumnId } : {}),
    });
  }

  if (isLoading) {
    return (
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-96 w-72 shrink-0 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError || !board) {
    return (
      <Card className="items-center rounded-xl border-dashed border-border p-16 text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
          <Rocket className="size-5 text-muted-foreground" />
        </div>
        <h3 className="font-medium">No active sprint</h3>
        <p className="mt-1 text-sm text-muted-foreground">Start a sprint to see the board.</p>
      </Card>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{board.sprint.name}</h1>
        {board.sprint.goal && <p className="text-sm text-muted-foreground">{board.sprint.goal}</p>}
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <BoardColumn key={col.id} id={col.id} title={col.title} issues={columns[col.id]} />
          ))}
        </div>
      </DndContext>
    </div>
  );
}
