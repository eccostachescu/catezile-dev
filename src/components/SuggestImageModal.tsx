import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SuggestImageModalProps {
  eventId: string;
  eventTitle: string;
}

export function SuggestImageModal({ eventId, eventTitle }: SuggestImageModalProps) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl.trim()) {
      toast({
        title: "Eroare",
        description: "Te rog să introduci un URL valid pentru imagine",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('suggest_image', {
        body: {
          eventId,
          imageUrl: imageUrl.trim(),
          reason: reason.trim() || undefined
        }
      });

      if (error) throw error;

      toast({
        title: "Succes!",
        description: "Propunerea ta de imagine a fost trimisă pentru aprobare",
      });

      setOpen(false);
      setImageUrl("");
      setReason("");
    } catch (error) {
      console.error('Error suggesting image:', error);
      toast({
        title: "Eroare",
        description: "Nu am putut trimite propunerea. Te rog încearcă din nou.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Camera className="w-4 h-4 mr-2" />
          Propune imagine
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Propune o imagine nouă</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="event-title">Eveniment</Label>
            <Input
              id="event-title"
              value={eventTitle}
              disabled
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="image-url">URL imagine *</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="reason">Motiv (opțional)</Label>
            <Textarea
              id="reason"
              placeholder="De ce consideri că această imagine este mai potrivită?"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
          </div>

          {imageUrl && (
            <div>
              <Label>Previzualizare</Label>
              <div className="mt-2 border rounded-md overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Previzualizare imagine propusă"
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Anulează
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !imageUrl.trim()}
            >
              {isSubmitting ? "Se trimite..." : "Trimite propunerea"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}