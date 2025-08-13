import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BackgroundOption {
  id: string;
  name: string;
  type: 'image' | 'gradient';
  value: string;
  preview: string;
}

interface BackgroundPickerProps {
  currentBackground?: string;
  onBackgroundChange?: (background: string) => void;
  className?: string;
}

const DEFAULT_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'default',
    name: 'Implicit',
    type: 'gradient',
    value: 'linear-gradient(135deg, hsl(var(--primary)/0.1), hsl(var(--primary)/0.05))',
    preview: 'bg-gradient-to-br from-primary/10 to-primary/5'
  },
  {
    id: 'sunset',
    name: 'Apus',
    type: 'gradient',
    value: 'linear-gradient(135deg, #ff6b6b, #ffa726, #ffcc02)',
    preview: 'bg-gradient-to-br from-red-400 to-orange-400'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    type: 'gradient',
    value: 'linear-gradient(135deg, #667eea, #764ba2)',
    preview: 'bg-gradient-to-br from-blue-400 to-purple-500'
  },
  {
    id: 'forest',
    name: 'Pădure',
    type: 'gradient',
    value: 'linear-gradient(135deg, #11998e, #38ef7d)',
    preview: 'bg-gradient-to-br from-teal-600 to-green-400'
  },
  {
    id: 'midnight',
    name: 'Miezul nopții',
    type: 'gradient',
    value: 'linear-gradient(135deg, #2c3e50, #3498db)',
    preview: 'bg-gradient-to-br from-slate-700 to-blue-500'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    type: 'gradient',
    value: 'linear-gradient(135deg, #a8e6cf, #dcedc8, #ffd3a5, #fd9853)',
    preview: 'bg-gradient-to-br from-green-200 via-lime-200 to-orange-300'
  }
];

export default function BackgroundPicker({
  currentBackground,
  onBackgroundChange,
  className
}: BackgroundPickerProps) {
  const [selectedBackground, setSelectedBackground] = useState<string>(
    currentBackground || DEFAULT_BACKGROUNDS[0].value
  );

  useEffect(() => {
    // Load saved background from localStorage
    const savedBackground = localStorage.getItem('catezile-background');
    if (savedBackground) {
      setSelectedBackground(savedBackground);
      onBackgroundChange?.(savedBackground);
    }
  }, [onBackgroundChange]);

  const handleBackgroundSelect = (background: BackgroundOption) => {
    setSelectedBackground(background.value);
    onBackgroundChange?.(background.value);
    
    // Save to localStorage
    localStorage.setItem('catezile-background', background.value);
    
    // Track background change
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'bg_change', {
        background_id: background.id,
        background_type: background.type
      });
    }
  };

  const resetToDefault = () => {
    const defaultBg = DEFAULT_BACKGROUNDS[0];
    handleBackgroundSelect(defaultBg);
  };

  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Fundal & temă
            </h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetToDefault}
          >
            Resetează
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Personalizează fundalul countdown-ului după preferințele tale.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {DEFAULT_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => handleBackgroundSelect(bg)}
              className={cn(
                "relative aspect-video rounded-lg border-2 transition-all hover:scale-105",
                selectedBackground === bg.value 
                  ? "border-primary ring-2 ring-primary/20" 
                  : "border-border hover:border-primary/50",
                bg.preview
              )}
            >
              <div className="absolute inset-0 rounded-lg bg-black/20" />
              
              {selectedBackground === bg.value && (
                <div className="absolute top-2 right-2 rounded-full bg-primary text-primary-foreground p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}
              
              <div className="absolute bottom-2 left-2 right-2">
                <div className="text-xs font-medium text-white drop-shadow-sm">
                  {bg.name}
                </div>
              </div>
            </button>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>💡 Preferința ta va fi salvată pentru viitoarele vizite.</p>
        </div>
      </div>
    </Card>
  );
}