import { useProjects } from "@/contexts/ProjectContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FolderKanban } from "lucide-react";

export function ProjectSwitcher() {
  const { projects, activeProject, setActiveProjectId, loading } = useProjects();

  if (loading) return null;
  if (projects.length === 0) {
    return (
      <span className="text-xs text-muted-foreground hidden md:inline">
        No projects yet
      </span>
    );
  }

  return (
    <Select
      value={activeProject?.id ?? undefined}
      onValueChange={(v) => setActiveProjectId(v)}
    >
      <SelectTrigger className="h-9 w-[260px] gap-2">
        <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />
        <SelectValue placeholder="Select project" />
      </SelectTrigger>
      <SelectContent>
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <span className="font-medium">{p.code}</span>
            <span className="text-muted-foreground"> · {p.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
