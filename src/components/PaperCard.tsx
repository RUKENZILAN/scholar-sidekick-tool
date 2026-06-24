import { useState } from "react";
import { Copy, ExternalLink, Trash2, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toBibTeX, type Paper } from "@/lib/citations";
import { toast } from "sonner";

export function PaperCard({ paper, onDelete }: { paper: Paper; onDelete: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const bib = toBibTeX(paper);

  async function copyBib() {
    await navigator.clipboard.writeText(bib);
    toast.success("BibTeX copied");
  }
  async function copyKey() {
    await navigator.clipboard.writeText(`\\cite{${paper.bibKey}}`);
    toast.success("Cite key copied");
  }

  return (
    <article className="group rounded-lg border bg-card p-5 transition-colors hover:border-foreground/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="font-serif text-lg leading-snug text-card-foreground">{paper.title || "Untitled"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {paper.authors.slice(0, 4).join(", ")}
            {paper.authors.length > 4 && " et al."}
            {paper.year ? ` · ${paper.year}` : ""}
            {paper.venue ? ` · ${paper.venue}` : ""}
          </p>
        </div>
        <button
          onClick={copyKey}
          className="shrink-0 rounded border border-dashed border-border bg-muted/50 px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Copy \\cite{key}"
        >
          {paper.bibKey}
        </button>
      </div>

      {paper.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {paper.tags.map((t) => (
            <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" variant="outline" onClick={copyBib}>
          <Copy className="size-3.5" /> BibTeX
        </Button>
        {paper.url && (
          <Button size="sm" variant="ghost" asChild>
            <a href={paper.url} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" /> Open
            </a>
          </Button>
        )}
        <Button size="sm" variant="ghost" onClick={() => setOpen((o) => !o)}>
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          {open ? "Hide" : "Details"}
        </Button>
        <div className="ml-auto">
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(paper.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="mt-4 space-y-3 border-t pt-4">
          {paper.abstract && (
            <p className="text-sm leading-relaxed text-muted-foreground">{paper.abstract}</p>
          )}
          <pre className="overflow-x-auto rounded-md bg-muted p-3 font-mono text-xs leading-relaxed text-foreground/90">
{bib}
          </pre>
        </div>
      )}
    </article>
  );
}
