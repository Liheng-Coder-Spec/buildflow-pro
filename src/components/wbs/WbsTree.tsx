import { useState } from "react";
import { ChevronRight, Folder, FolderOpen, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { WbsTreeNode, WBS_NODE_TYPE_LABELS } from "@/lib/wbsMeta";
import { NodeRollup } from "@/lib/scheduleMeta";
import { WbsScheduleStrip } from "@/components/wbs/WbsScheduleStrip";

interface Props {
  nodes: WbsTreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild?: (parentId: string | null) => void;
  canEdit: boolean;
  search: string;
  getRollup?: (nodeId: string) => NodeRollup | undefined;
}

export function WbsTree({ nodes, selectedId, onSelect, onAddChild, canEdit, search, getRollup }: Props) {
  return (
    <div className="text-sm">
      {canEdit && (
        <div className="px-2 py-2 border-b mb-1">
          <Button size="sm" variant="ghost" className="w-full justify-start gap-2" onClick={() => onAddChild?.(null)}>
            <Plus className="h-3.5 w-3.5" /> Add root node
          </Button>
        </div>
      )}
      {nodes.length === 0 ? (
        <div className="text-xs text-muted-foreground px-3 py-6 text-center">
          No WBS nodes yet.
          {canEdit && <div className="mt-1">Add your first building or zone.</div>}
        </div>
      ) : (
        <ul className="space-y-0.5">
          {nodes.map((n) => (
            <TreeRow
              key={n.id}
              node={n}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              canEdit={canEdit}
              search={search.toLowerCase()}
              getRollup={getRollup}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TreeRow({
  node,
  depth,
  selectedId,
  onSelect,
  onAddChild,
  canEdit,
  search,
  getRollup,
}: {
  node: WbsTreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddChild?: (parentId: string | null) => void;
  canEdit: boolean;
  search: string;
  getRollup?: (nodeId: string) => import("@/lib/scheduleMeta").NodeRollup | undefined;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const matches =
    !search ||
    node.name.toLowerCase().includes(search) ||
    node.code.toLowerCase().includes(search) ||
    node.path_text.toLowerCase().includes(search);

  // If searching and this branch has no match anywhere, hide
  const branchMatches = matches || branchHasMatch(node, search);
  if (!branchMatches) return null;

  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelect(node.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSelect(node.id);
        }}
        className={cn(
          "group flex items-center gap-1 px-1.5 py-1 rounded-md cursor-pointer hover:bg-muted/60 transition-colors",
          selectedId === node.id && "bg-accent text-accent-foreground hover:bg-accent",
        )}
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpen((o) => !o);
            }}
            className="h-4 w-4 inline-flex items-center justify-center shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={open ? "Collapse" : "Expand"}
          >
            <ChevronRight className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-90")} />
          </button>
        ) : (
          <span className="h-4 w-4 inline-block shrink-0" />
        )}
        {open && hasChildren ? (
          <FolderOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        ) : (
          <Folder className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0 flex items-baseline gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">{node.code}</span>
          <span className="truncate">{node.name}</span>
          <span className="text-[10px] text-muted-foreground/70 hidden sm:inline">
            {WBS_NODE_TYPE_LABELS[node.node_type]}
          </span>
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild?.(node.id);
            }}
            className="opacity-0 group-hover:opacity-100 h-5 w-5 inline-flex items-center justify-center rounded hover:bg-background/60"
            aria-label="Add child"
            title="Add child"
          >
            <Plus className="h-3 w-3" />
          </button>
        )}
      </div>
      {hasChildren && open && (
        <ul className="space-y-0.5">
          {node.children.map((c) => (
            <TreeRow
              key={c.id}
              node={c}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onAddChild={onAddChild}
              canEdit={canEdit}
              search={search}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function branchHasMatch(node: WbsTreeNode, search: string): boolean {
  if (!search) return true;
  if (
    node.name.toLowerCase().includes(search) ||
    node.code.toLowerCase().includes(search)
  )
    return true;
  return node.children.some((c) => branchHasMatch(c, search));
}
