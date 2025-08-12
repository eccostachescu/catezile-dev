import { useEffect, useMemo, useState } from "react";
import Container from "@/components/Container";

import { SEO } from "@/seo/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { routes } from "@/app/routes";

interface CountdownItem {
  id: string;
  title: string;
  created_at: string | null;
  target_at: string;
  owner_id: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | string;
}

type Filter = "PENDING" | "REJECTED" | "ALL";

export default function AdminModeration() {
  const [items, setItems] = useState<CountdownItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filter, setFilter] = useState<Filter>("PENDING");

  const filtered = useMemo(() => {
    if (filter === "ALL") return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const refresh = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("countdown")
      .select("id,title,created_at,target_at,owner_id,status")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: "Eroare la încărcare", description: error.message });
    } else {
      setItems((data as any) as CountdownItem[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    const { error } = await supabase
      .from("countdown")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast({ title: "Acțiune eșuată", description: error.message });
    } else {
      toast({ title: "Salvat", description: `Status: ${status}` });
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)));
    }
  };

  const removeItem = async (id: string) => {
    const { error } = await supabase.from("countdown").delete().eq("id", id);
    if (error) {
      toast({ title: "Ștergere eșuată", description: error.message });
    } else {
      toast({ title: "Șters" });
      setItems((prev) => prev.filter((x) => x.id !== id));
    }
  };

  const counts = useMemo(() => ({
    all: items.length,
    pending: items.filter((i) => i.status === "PENDING").length,
    rejected: items.filter((i) => i.status === "REJECTED").length,
    approved: items.filter((i) => i.status === "APPROVED").length,
  }), [items]);

  return (
    <>
      <SEO title="Admin Moderare UGC" path="/admin/moderation" noIndex />
      <Container className="py-6">
          <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-semibold">Moderare UGC</h1>
            <div className="flex items-center gap-2">
              <Button variant={filter === "PENDING" ? "default" : "outline"} onClick={() => setFilter("PENDING")}>
                PENDING <Badge className="ml-2" variant="secondary">{counts.pending}</Badge>
              </Button>
              <Button variant={filter === "REJECTED" ? "default" : "outline"} onClick={() => setFilter("REJECTED")}>
                REJECTED <Badge className="ml-2" variant="secondary">{counts.rejected}</Badge>
              </Button>
              <Button variant={filter === "ALL" ? "default" : "outline"} onClick={() => setFilter("ALL")}>
                TOATE <Badge className="ml-2" variant="secondary">{counts.all}</Badge>
              </Button>
              <Button variant="secondary" onClick={refresh} disabled={loading}>
                {loading ? "Se încarcă..." : "Reîncarcă"}
              </Button>
            </div>
          </header>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titlu</TableHead>
                <TableHead>Țintă</TableHead>
                <TableHead>Creat</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="max-w-[24rem] truncate">
                    <a href={routes.countdown(item.id)} target="_blank" rel="noreferrer" className="underline">
                      {item.title}
                    </a>
                  </TableCell>
                  <TableCell>{new Date(item.target_at).toLocaleString()}</TableCell>
                  <TableCell>{item.created_at ? new Date(item.created_at).toLocaleString() : ""}</TableCell>
                  <TableCell>
                    {item.status === "APPROVED" && <Badge variant="secondary">APPROVED</Badge>}
                    {item.status === "PENDING" && <Badge> PENDING </Badge>}
                    {item.status === "REJECTED" && <Badge variant="destructive">REJECTED</Badge>}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {item.status !== "APPROVED" && (
                      <Button size="sm" onClick={() => updateStatus(item.id, "APPROVED")}>Aprobă</Button>
                    )}
                    {item.status !== "REJECTED" && (
                      <Button size="sm" variant="outline" onClick={() => updateStatus(item.id, "REJECTED")}>Respinge</Button>
                    )}
                    <Button size="sm" variant="destructive" onClick={() => removeItem(item.id)}>Șterge</Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                    Niciun element de moderat.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Container>
    </>
  );
}
