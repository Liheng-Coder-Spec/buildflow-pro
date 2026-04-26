import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Plus, Trash2, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import {
  WbsAssignment, WbsPermission, WBS_PERMISSION_LABELS, WBS_PERMISSION_DESCRIPTIONS,
} from "@/lib/wbsMeta";

interface ProfileLite {
  id: string;
  full_name: string;
  job_title: string | null;
}

interface Props {
  nodeId: string;
  nodePath: string;
  canManage: boolean;
}

export function WbsAssignmentsTab({ nodeId, nodePath, canManage }: Props) {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<WbsAssignment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});
  const [allProfiles, setAllProfiles] = useState<ProfileLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickedUser, setPickedUser] = useState<string | null>(null);
  const [pickedPerm, setPickedPerm] = useState<WbsPermission>("view");
  const [adding, setAdding] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: aData } = await supabase
      .from("wbs_assignments")
      .select("*")
      .eq("wbs_node_id", nodeId);
    const ids = new Set<string>();
    (aData ?? []).forEach((a: any) => ids.add(a.user_id));
    const [profsRes, allRes] = await Promise.all([
      ids.size > 0
        ? supabase.from("profiles").select("id, full_name, job_title").in("id", Array.from(ids))
        : Promise.resolve({ data: [] as ProfileLite[] }),
      supabase.from("profiles").select("id, full_name, job_title").order("full_name"),
    ]);
    const m: Record<string, ProfileLite> = {};
    (profsRes.data ?? []).forEach((p: any) => { m[p.id] = p; });
    setProfiles(m);
    setAllProfiles((allRes.data ?? []) as ProfileLite[]);
    setAssignments((aData ?? []) as WbsAssignment[]);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [nodeId]);

  const onAdd = async () => {
    if (!pickedUser) return;
    setAdding(true);
    const { error } = await supabase.from("wbs_assignments").insert({
      wbs_node_id: nodeId,
      user_id: pickedUser,
      permission: pickedPerm,
      created_by: user?.id ?? null,
    });
    setAdding(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "User already has this permission" : error.message);
      return;
    }
    toast.success("Permission granted");
    setPickedUser(null);
    setPickerOpen(false);
    await load();
  };

  const onRemove = async (id: string) => {
    const { error } = await supabase.from("wbs_assignments").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Permission removed");
    await load();
  };

  const pickedProfile = pickedUser ? allProfiles.find((p) => p.id === pickedUser) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access permissions</CardTitle>
        <CardDescription>
          Permissions on <span className="font-mono">{nodePath}</span> are inherited by every descendant node.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canManage && (
          <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-md border bg-muted/30">
            <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex-1 justify-between font-normal">
                  {pickedProfile ? pickedProfile.full_name : "Pick a user..."}
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0 w-[320px]" align="start">
                <Command>
                  <CommandInput placeholder="Search users..." />
                  <CommandList>
                    <CommandEmpty>No users found.</CommandEmpty>
                    <CommandGroup>
                      {allProfiles.map((p) => (
                        <CommandItem
                          key={p.id}
                          value={`${p.full_name} ${p.job_title ?? ""}`}
                          onSelect={() => {
                            setPickedUser(p.id);
                            setPickerOpen(false);
                          }}
                        >
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                              {(p.full_name || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm">{p.full_name}</span>
                            {p.job_title && <span className="text-[11px] text-muted-foreground">{p.job_title}</span>}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Select value={pickedPerm} onValueChange={(v) => setPickedPerm(v as WbsPermission)}>
              <SelectTrigger className="sm:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(WBS_PERMISSION_LABELS) as WbsPermission[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    <div className="flex flex-col">
                      <span>{WBS_PERMISSION_LABELS[p]}</span>
                      <span className="text-[10px] text-muted-foreground">{WBS_PERMISSION_DESCRIPTIONS[p]}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={onAdd} disabled={!pickedUser || adding}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Grant
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-muted-foreground py-6 text-center">Loading...</div>
        ) : assignments.length === 0 ? (
          <div className="text-sm text-muted-foreground py-6 text-center">
            No direct assignments. Users may still have access through ancestor nodes.
          </div>
        ) : (
          <div className="space-y-1">
            {assignments.map((a) => {
              const p = profiles[a.user_id];
              return (
                <div key={a.id} className="flex items-center justify-between gap-2 px-2 py-2 rounded-md hover:bg-muted/40">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
                        {(p?.full_name || "?").split(" ").map((s) => s[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{p?.full_name || a.user_id.slice(0, 8)}</div>
                      {p?.job_title && <div className="text-[11px] text-muted-foreground truncate">{p.job_title}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="secondary">{WBS_PERMISSION_LABELS[a.permission]}</Badge>
                    {canManage && (
                      <Button size="icon" variant="ghost" onClick={() => onRemove(a.id)} aria-label="Remove">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
