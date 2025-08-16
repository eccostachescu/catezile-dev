import { useState, useEffect } from "react";
import Container from "@/components/Container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, X, Calendar, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ro } from "date-fns/locale";

interface ImageSuggestion {
  id: string;
  event_id: string;
  suggested_image_url: string;
  suggested_by: string | null;
  reason: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  event: {
    title: string;
    image_url: string | null;
  };
}

export default function AdminImageSuggestions() {
  const [suggestions, setSuggestions] = useState<ImageSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
  }, []);

  const loadSuggestions = async () => {
    try {
      const { data, error } = await supabase
        .from('event_image_suggestion')
        .select(`
          *,
          event!inner(title, image_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuggestions((data as any) || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut încărca propunerile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (suggestionId: string, action: 'APPROVE' | 'REJECT') => {
    setActionLoading(suggestionId);

    try {
      const { error } = await supabase.functions.invoke('moderate_image_suggestion', {
        body: {
          suggestionId,
          action,
          adminNotes: adminNotes[suggestionId] || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Succes!",
        description: `Propunerea a fost ${action === 'APPROVE' ? 'aprobată' : 'respinsă'}`,
      });

      loadSuggestions();
    } catch (error) {
      console.error('Error moderating suggestion:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut procesa acțiunea",
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'APPROVED': return 'bg-green-500';
      case 'REJECTED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'În așteptare';
      case 'APPROVED': return 'Aprobată';
      case 'REJECTED': return 'Respinsă';
      default: return status;
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">Se încarcă...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className="py-8">
        <div className="flex items-center mb-6">
          <Link to="/admin">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Înapoi la Admin
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Propuneri de imagini</h1>

        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nu există propuneri de imagini
          </div>
        ) : (
          <div className="space-y-6">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="border rounded-lg p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{suggestion.event.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(suggestion.created_at), 'dd MMM yyyy, HH:mm', { locale: ro })}
                      </div>
                      {suggestion.suggested_by && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {suggestion.suggested_by}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={getStatusColor(suggestion.status)}>
                    {getStatusText(suggestion.status)}
                  </Badge>
                </div>

                {suggestion.reason && (
                  <div>
                    <p className="text-sm font-medium">Motiv:</p>
                    <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Imagine curentă:</p>
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={suggestion.event.image_url || '/placeholder.svg'}
                        alt="Imagine curentă"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Imagine propusă:</p>
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={suggestion.suggested_image_url}
                        alt="Imagine propusă"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  </div>
                </div>

                {suggestion.status === 'PENDING' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">Note admin (opțional):</label>
                      <Textarea
                        value={adminNotes[suggestion.id] || ''}
                        onChange={(e) => setAdminNotes(prev => ({
                          ...prev,
                          [suggestion.id]: e.target.value
                        }))}
                        placeholder="Adaugă note despre decizia ta..."
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAction(suggestion.id, 'APPROVE')}
                        disabled={actionLoading === suggestion.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Aprobă
                      </Button>
                      <Button
                        onClick={() => handleAction(suggestion.id, 'REJECT')}
                        disabled={actionLoading === suggestion.id}
                        variant="destructive"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Respinge
                      </Button>
                    </div>
                  </div>
                )}

                {suggestion.admin_notes && (
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm font-medium">Note admin:</p>
                    <p className="text-sm">{suggestion.admin_notes}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}