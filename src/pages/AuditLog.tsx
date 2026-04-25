import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuditRow {
  id: string;
  entity_type: string;
  entity_id: string | null;
  action: string;
  user_id: string | null;
  before_data: any;
  after_data: any;
  created_at: string;
}

const ACTION_COLORS: Record<string, string> = {
  create: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  update: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  delete: "bg-destructive/15 text-destructive",
};

export default function AuditLog() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [rows, setRows] = useState<AuditRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [active, setActive] = useState<AuditRow | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      setRows((data ?? []) as AuditRow[]);

      const userIds = Array.from(
        new Set((data ?? []).map((r: any) => r.user_id).filter(Boolean)),
      );
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id,full_name")
          .in("id", userIds);
        const map: Record<string, string> = {};
        (profs ?? []).forEach((p: any) => (map[p.id] = p.full_name));
        setProfiles(map);
      }
      setLoading(false);
    };
    if (isAdmin) load();
    else setLoading(false);
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          <ShieldCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
          Admins only.
        </CardContent>
      </Card>
    );
  }

  const entityTypes = Array.from(new Set(rows.map((r) => r.entity_type))).sort();
  const filtered = rows.filter((r) => {
    if (entityFilter !== "all" && r.entity_type !== entityFilter) return false;
    if (actionFilter !== "all" && r.action !== actionFilter) return false;
    if (search) {
      const s = search.toLowerCase();
      const haystack = `${r.entity_type} ${r.entity_id ?? ""} ${profiles[r.user_id ?? ""] ?? ""}`.toLowerCase();
      if (!haystack.includes(s)) return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Append-only record of changes across the system (latest 500 events)
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base mr-auto">Events</CardTitle>
            <Input
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-40"
            />
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                {entityTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-6">No events.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Entity ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer"
                    onClick={() => setActive(r)}
                  >
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">{r.entity_type}</TableCell>
                    <TableCell>
                      <Badge className={ACTION_COLORS[r.action] || ""} variant="outline">
                        {r.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {profiles[r.user_id ?? ""] ?? (r.user_id ? "Unknown" : "System")}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[200px]">
                      {r.entity_id ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {active?.action} · {active?.entity_type}
            </SheetTitle>
            <SheetDescription>
              {active && new Date(active.created_at).toLocaleString()} ·{" "}
              {profiles[active?.user_id ?? ""] ?? "System"}
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-4 mt-4">
            {active?.before_data && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">Before</div>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(active.before_data, null, 2)}
                </pre>
              </div>
            )}
            {active?.after_data && (
              <div>
                <div className="text-xs font-semibold text-muted-foreground mb-1">After</div>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(active.after_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
