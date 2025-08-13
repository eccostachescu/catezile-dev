import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Facebook, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonsProps {
  title: string;
  url: string;
  description?: string;
  className?: string;
}

export default function ShareButtons({ 
  title, 
  url, 
  description,
  className 
}: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState(false);

  const shareData = {
    title,
    text: description || `Urmărește countdown-ul pentru ${title}`,
    url
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return false;
    
    try {
      setIsSharing(true);
      await navigator.share(shareData);
      
      // Track share event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share_click', {
          method: 'native',
          content_type: 'countdown',
          item_id: url
        });
      }
      
      return true;
    } catch (error) {
      if ((error as Error).name !== 'AbortError') {
        console.error('Native share failed:', error);
      }
      return false;
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiat!",
        description: "Linkul a fost copiat în clipboard."
      });
      
      // Track copy event
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'share_click', {
          method: 'copy',
          content_type: 'countdown',
          item_id: url
        });
      }
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut copia linkul.",
        variant: "destructive"
      });
    }
  };

  const shareToFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
    
    // Track Facebook share
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share_click', {
        method: 'facebook',
        content_type: 'countdown',
        item_id: url
      });
    }
  };

  const shareToWhatsApp = () => {
    const text = `${title} - ${description || 'Urmărește countdown-ul'} ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    
    // Track WhatsApp share
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share_click', {
        method: 'whatsapp',
        content_type: 'countdown',
        item_id: url
      });
    }
  };

  const shareToX = () => {
    const text = `${title} - ${description || 'Urmărește countdown-ul'}`;
    const xUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(xUrl, '_blank', 'width=600,height=400');
    
    // Track X share
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'share_click', {
        method: 'x',
        content_type: 'countdown',
        item_id: url
      });
    }
  };

  const handleMainShare = async () => {
    const nativeShareWorked = await handleNativeShare();
    if (!nativeShareWorked) {
      // Fallback to copy
      copyToClipboard();
    }
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Distribuie countdown-ul
        </h3>
        
        {/* Primary Share Button */}
        <Button 
          onClick={handleMainShare}
          disabled={isSharing}
          className="w-full gap-2"
          size="lg"
        >
          <Share2 className="h-4 w-4" />
          {isSharing ? 'Se distribuie...' : 'Distribuie'}
        </Button>
        
        {/* Secondary Share Options */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copiază</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareToFacebook}
            className="gap-2"
          >
            <Facebook className="h-4 w-4" />
            <span className="hidden sm:inline">Facebook</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareToWhatsApp}
            className="gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shareToX}
            className="gap-2"
          >
            <span className="font-bold text-xs">𝕏</span>
            <span className="hidden sm:inline">X</span>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Invită-ți prietenii să urmărească countdown-ul împreună cu tine!
        </p>
      </div>
    </Card>
  );
}