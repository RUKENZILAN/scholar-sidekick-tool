import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { fetchByDoi } from "@/lib/crossref";
import { makeBibKey, makeId, type Paper } from "@/lib/citations";

export function AddPaperDialog({ onAdd }: { onAdd: (p: Paper) => void }) {
  const [open, setOpen] = useState(false);
  const [doi, setDoi] = useState("");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [authors, setAuthors] = useState("");
  const [year, setYear] = useState("");
  const [venue, setVenue] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const [abstract, setAbstract] = useState("");

  function reset() {
    setDoi(""); setTitle(""); setAuthors(""); setYear("");
    setVenue(""); setUrl(""); setTags(""); setAbstract("");
  }

  async function handleDoi() {
    if (!doi.trim()) return;
    setLoading(true);
    try {
      const p = await fetchByDoi(doi);
      onAdd(p);
      toast.success("Added", { description: p.title });
      reset();
      setOpen(false);
    } catch (e) {
      toast.error("Lookup failed", { description: (e as Error).message });
    } finally {
      setLoading(false);
    }
  }

  function handleManual() {
    if (!title.trim()) {
      toast.error("Title required");
      return;
    }
    const authorList = authors.split(/[;,]|\sand\s/).map((s) => s.trim()).filter(Boolean);
    const y = year ? parseInt(year, 10) : null;
    const p: Paper = {
      id: makeId(),
      title: title.trim(),
      authors: authorList,
      year: Number.isFinite(y as number) ? (y as number) : null,
      venue: venue.trim(),
      doi: "",
      url: url.trim(),
      abstract: abstract.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      bibKey: makeBibKey(authorList, y, title),
      addedAt: Date.now(),
    };
    onAdd(p);
    toast.success("Added", { description: p.title });
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="size-4" /> Add paper
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add a paper</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="doi">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="doi">From DOI / arXiv</TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>
          <TabsContent value="doi" className="space-y-3 pt-3">
            <Label htmlFor="doi">DOI</Label>
            <Input
              id="doi"
              placeholder="10.1145/3442188.3445922 or https://doi.org/..."
              value={doi}
              onChange={(e) => setDoi(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleDoi()}
            />
            <p className="text-xs text-muted-foreground">
              Metadata is fetched from Crossref. For arXiv, paste the DOI like <code>10.48550/arXiv.2106.09685</code>.
            </p>
            <DialogFooter>
              <Button onClick={handleDoi} disabled={loading || !doi.trim()}>
                {loading && <Loader2 className="size-4 animate-spin" />}
                Fetch &amp; add
              </Button>
            </DialogFooter>
          </TabsContent>
          <TabsContent value="manual" className="space-y-3 pt-3">
            <div className="grid gap-2">
              <Label htmlFor="t">Title</Label>
              <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="a">Authors (comma or “and” separated)</Label>
              <Input id="a" value={authors} onChange={(e) => setAuthors(e.target.value)} placeholder="Ada Lovelace, Alan Turing" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="grid gap-2">
                <Label htmlFor="y">Year</Label>
                <Input id="y" value={year} onChange={(e) => setYear(e.target.value)} inputMode="numeric" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="v">Venue</Label>
                <Input id="v" value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="NeurIPS" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="u">URL</Label>
              <Input id="u" value={url} onChange={(e) => setUrl(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tg">Tags (comma separated)</Label>
              <Input id="tg" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="transformers, attention" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ab">Abstract</Label>
              <Textarea id="ab" rows={3} value={abstract} onChange={(e) => setAbstract(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={handleManual}>Add</Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
