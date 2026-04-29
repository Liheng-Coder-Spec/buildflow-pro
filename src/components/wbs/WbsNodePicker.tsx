import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useWbsTree } from "@/hooks/useWbsTree";
import { flattenTree, WbsTreeNode } from "@/lib/wbsMeta";

interface Props {
  projectId: string;
  value: string | null;
  onChange: (id: string | null, node: WbsTreeNode | null) => void;
  required?: boolean;
}

export function WbsNodePicker({ projectId, value, onChange, required }: Props) {
  const { tree, loading } = useWbsTree(projectId);
  const [open, setOpen] = useState(false);

  const flat = useMemo(() => flattenTree(tree), [tree]);
  const selected = flat.find((n) => n.id === value) ?? null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !selected && "text-muted-foreground",
          )}
        >
          {selected ? (
            <span className="truncate text-left">
              <span className="font-mono text-xs mr-2 text-muted-foreground">{selected.code}</span>
              {selected.name}
            </span>
          ) : loading ? (
            "Loading WBS..."
          ) : flat.length === 0 ? (
            "No WBS nodes — create them on the WBS page first"
          ) : (
            `Pick a WBS location${required ? " *" : ""}`
          )}
          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command
          filter={(value, search) => {
            // value is "code|name|path"
            return value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
          }}
        >
          <CommandInput placeholder="Search by code, name, or path..." />
          <CommandList>
            <CommandEmpty>No matching nodes.</CommandEmpty>
            <CommandGroup>
              {!required && (
                <CommandItem
                  value="__none__"
                  onSelect={() => {
                    onChange(null, null);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-4 w-4 mr-2", !value ? "opacity-100" : "opacity-0")} />
                  <span className="text-muted-foreground italic">No WBS location</span>
                </CommandItem>
              )}
              {flat.map((n) => (
                <CommandItem
                  key={n.id}
                  value={`${n.code}|${n.name}|${n.path_text}`}
                  onSelect={() => {
                    onChange(n.id, n);
                    setOpen(false);
                  }}
                >
                  <Check className={cn("h-4 w-4 mr-2 shrink-0", value === n.id ? "opacity-100" : "opacity-0")} />
                  <div
                    className="flex flex-col min-w-0"
                    style={{ paddingLeft: `${n.depth * 10}px` }}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="font-mono text-[11px] text-muted-foreground">{n.code}</span>
                      <span className="truncate">{n.name}</span>
                    </div>
                    {n.depth > 0 && (
                      <span className="text-[10px] text-muted-foreground/70 truncate">{n.path_text}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
