export type WbsNodeType =
  | "building"
  | "level"
  | "zone"
  | "sub_zone"
  | "area"
  | "system"
  | "package"
  | "other";

export type WbsPermission = "view" | "edit" | "manage";

export const WBS_NODE_TYPE_LABELS: Record<WbsNodeType, string> = {
  building: "Building",
  level: "Level",
  zone: "Zone",
  sub_zone: "Sub-zone",
  area: "Area",
  system: "System",
  package: "Package",
  other: "Other",
};

export const WBS_PERMISSION_LABELS: Record<WbsPermission, string> = {
  view: "View",
  edit: "Edit",
  manage: "Manage",
};

export const WBS_PERMISSION_DESCRIPTIONS: Record<WbsPermission, string> = {
  view: "Can see this node and everything inside",
  edit: "View + create/rename/move children",
  manage: "Edit + grant access to other users",
};

export interface WbsNode {
  id: string;
  project_id: string;
  parent_id: string | null;
  node_type: WbsNodeType;
  name: string;
  code: string;
  description: string | null;
  path: string[];
  path_text: string;
  depth: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface WbsAssignment {
  id: string;
  wbs_node_id: string;
  user_id: string;
  permission: WbsPermission;
  created_at: string;
}

export interface WbsTreeNode extends WbsNode {
  children: WbsTreeNode[];
}

export function buildWbsTree(rows: WbsNode[]): WbsTreeNode[] {
  const map = new Map<string, WbsTreeNode>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: WbsTreeNode[] = [];
  map.forEach((n) => {
    if (n.parent_id && map.has(n.parent_id)) {
      map.get(n.parent_id)!.children.push(n);
    } else {
      roots.push(n);
    }
  });
  const sortNodes = (arr: WbsTreeNode[]) => {
    arr.sort((a, b) =>
      a.sort_order !== b.sort_order
        ? a.sort_order - b.sort_order
        : a.name.localeCompare(b.name),
    );
    arr.forEach((n) => sortNodes(n.children));
  };
  sortNodes(roots);
  return roots;
}

/** Flatten tree for searchable picker, depth-first preserving sort */
export function flattenTree(nodes: WbsTreeNode[]): WbsTreeNode[] {
  const out: WbsTreeNode[] = [];
  const walk = (arr: WbsTreeNode[]) => {
    for (const n of arr) {
      out.push(n);
      if (n.children.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}
