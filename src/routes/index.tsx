import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Search, BookMarked } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/sonner";
import { AddPaperDialog } from "@/components/AddPaperDialog";
import { PaperCard } from "@/components/PaperCard";
import {
  exportAllBib,
  loadPapers,
  savePapers,
  type Paper,
} from "@/lib/citations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RefDesk — Citation manager for CS researchers" },
      {
        name: "description",
        content:
          "A fast, local-first reference manager for computer science researchers. Import by DOI, tag, search, and export BibTeX.",
      },
      { property: "og:title", content: "RefDesk — Citation manager for CS researchers" },
      {
        property: "og:description",
        content: "Import by DOI, tag, search, and export BibTeX. Local-first, no account needed.",
      },
    ],
  }),
  component: Library,
});

function Library() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sort, setSort] = useState<"added" | "year" | "title">("added");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPapers(loadPapers());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) savePapers(papers);
  }, [papers, mounted]);

  const allTags = useMemo(() => {
    const m = new Map<string, number>();
    papers.forEach((p) => p.tags.forEach((t) => m.set(t, (m.get(t) || 0) + 1)));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [papers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = papers.filter((p) => {
      if (activeTag && !p.tags.includes(activeTag)) return false;
      if (!q) return true;
      const hay = [
        p.title,
        p.venue,
        p.bibKey,
        p.doi,
        p.abstract,
        p.authors.join(" "),
        p.tags.join(" "),
        p.year?.toString() || "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
    list = [...list].sort((a, b) => {
      if (sort === "year") return (b.year ?? 0) - (a.year ?? 0);
      if (sort === "title") return a.title.localeCompare(b.title);
      return b.addedAt - a.addedAt;
    });
    return list;
  }, [papers, query, activeTag, sort]);

  function add(p: Paper) {
    setPapers((prev) => {
      if (p.doi && prev.some((x) => x.doi && x.doi.toLowerCase() === p.doi.toLowerCase())) {
        return prev;
      }
      return [p, ...prev];
    });
  }
  function remove(id: string) {
    setPapers((prev) => prev.filter((p) => p.id !== id));
  }

  function exportBib() {
    const blob = new Blob([exportAllBib(papers)], { type: "application/x-bibtex" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "library.bib";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border/70 bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <BookMarked className="size-5" />
            </div>
            <div>
              <h1 className="font-serif text-xl leading-none">RefDesk</h1>
              <p className="text-xs text-muted-foreground">Citation manager for CS researchers</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportBib} disabled={papers.length === 0}>
              <Download className="size-4" /> Export .bib
            </Button>
            <AddPaperDialog onAdd={add} />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, author, venue, DOI, abstract…"
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-1 rounded-md border border-input p-1 text-sm">
            {(["added", "year", "title"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`rounded px-2.5 py-1 capitalize transition-colors ${
                  sort === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {allTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            <button
              onClick={() => setActiveTag(null)}
              className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                activeTag === null ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {allTags.map(([t, n]) => (
              <button
                key={t}
                onClick={() => setActiveTag(activeTag === t ? null : t)}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                  activeTag === t ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t} <span className="opacity-60">{n}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {filtered.length} of {papers.length} {papers.length === 1 ? "paper" : "papers"}
          </span>
          {activeTag && <Badge variant="outline">tag: {activeTag}</Badge>}
        </div>

        <section className="mt-3 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState hasAny={papers.length > 0} />
          ) : (
            filtered.map((p) => <PaperCard key={p.id} paper={p} onDelete={remove} />)
          )}
        </section>

        <footer className="mt-16 border-t pt-6 text-center text-xs text-muted-foreground">
          Local-first · Stored in your browser · Metadata via{" "}
          <a className="underline underline-offset-2" href="https://www.crossref.org/" target="_blank" rel="noreferrer">
            Crossref
          </a>
        </footer>
      </main>
    </div>
  );
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  return (
    <div className="rounded-lg border border-dashed bg-card/40 p-12 text-center">
      <h2 className="font-serif text-xl">{hasAny ? "Nothing matches" : "Your library is empty"}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        {hasAny
          ? "Try clearing the search or tag filter."
          : "Paste a DOI to import metadata from Crossref, or add a paper manually. Everything stays in your browser."}
      </p>
    </div>
  );
}
