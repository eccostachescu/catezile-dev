import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

interface Event {
  id: string;
  title: string;
  starts_at: string;
  status: string;
  editorial_status?: string;
  verified_at?: string;
  city?: { name: string };
  category?: { name: string };
  created_at: string;
  updated_at: string;
}

interface EventCategory {
  id: string;
  name: string;
  slug: string;
}

export default function AdminEvents() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  useEffect(() => {
    loadCategories();
    load();
  }, [search, statusFilter, categoryFilter, dateFromFilter, dateToFilter]);

  const loadCategories = async () => {
    const { data } = await supabase.from('event_category').select('*').order('name');
    setCategories(data || []);
  };

  const load = async () => {
    setLoading(true);
    let query = supabase
      .from('event')
      .select(`
        id, title, starts_at, status, editorial_status, verified_at, created_at, updated_at,
        city:city_id(name),
        category:category_id(name)
      `)
      .order('created_at', { ascending: false });

    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }
    if (categoryFilter !== 'all') {
      query = query.eq('category_id', categoryFilter);
    }
    if (dateFromFilter) {
      query = query.gte('starts_at', dateFromFilter);
    }
    if (dateToFilter) {
      query = query.lte('starts_at', dateToFilter);
    }

    const { data } = await query.limit(100);
    setEvents(data || []);
    setLoading(false);
  };

  const setEditorial = async (id: string, status: string) => {
    const { error } = await supabase
      .from('event')
      .update({ editorial_status: status })
      .eq('id', id);
    
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Actualizat", description: `Statusul editorial a fost schimbat în ${status}` });
      load();
    }
  };

  const verify = async (id: string) => {
    const { error } = await supabase
      .from('event')
      .update({ verified_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      toast({ title: "Eroare", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Verificat", description: "Evenimentul a fost marcat ca verificat" });
      load();
    }
  };

  return (
    <>
      <SEO title="Admin - Evenimente" noindex />
      <Container className="py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Administrare Evenimente</h1>
          <Button onClick={() => navigate('/admin')}>
            ← Înapoi la Admin
          </Button>
        </div>

        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Caută după titlu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate statusurile</SelectItem>
                <SelectItem value="DRAFT">DRAFT</SelectItem>
                <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                <SelectItem value="ARCHIVED">ARCHIVED</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toate categoriile</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              placeholder="Data de la"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
            />
            <Input
              type="date"
              placeholder="Data până la"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titlu</TableHead>
                <TableHead>Categorie</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Editorial</TableHead>
                <TableHead>Verificat</TableHead>
                <TableHead>Acțiuni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Se încarcă...
                  </TableCell>
                </TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Nu s-au găsit evenimente.
                  </TableCell>
                </TableRow>
              ) : (
                events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{event.title}</div>
                        {event.city && (
                          <div className="text-sm text-muted-foreground">{event.city.name}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {event.category ? (
                        <Badge variant="secondary">{event.category.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(new Date(event.starts_at), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {event.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={event.editorial_status === 'APPROVED' ? 'default' : 'outline'}>
                        {event.editorial_status || 'DRAFT'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {event.verified_at ? (
                        <Badge variant="default">✓</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {event.editorial_status !== 'APPROVED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditorial(event.id, 'APPROVED')}
                          >
                            Aprobă
                          </Button>
                        )}
                        {event.editorial_status !== 'REJECTED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditorial(event.id, 'REJECTED')}
                          >
                            Respinge
                          </Button>
                        )}
                        {!event.verified_at && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => verify(event.id)}
                          >
                            Verifică
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Container>
    </>
  );
}