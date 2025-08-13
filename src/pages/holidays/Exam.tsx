import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GraduationCap, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExamTimeline } from "@/components/holidays/ExamTimeline";
import { HolidaysAdRail } from "@/components/holidays/HolidaysAdRail";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/seo/SEO";

export default function ExamDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [exam, setExam] = useState<any>(null);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExam = async () => {
      if (!slug) return;
      
      try {
        const { data: examData } = await supabase
          .from('exam')
          .select('*')
          .eq('slug', slug)
          .single();
        
        if (examData) {
          setExam(examData);
          
          const { data: phasesData } = await supabase
            .from('exam_phase')
            .select('*')
            .eq('exam_id', examData.id)
            .order('starts_on');
          
          setPhases(phasesData || []);
        }
      } catch (error) {
        console.error('Error loading exam:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center">Se încarcă...</div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Examenul nu a fost găsit</h1>
            <p className="text-muted-foreground">
              Examenul căutat nu există sau nu este disponibil.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getLevelLabel = (level: string) => {
    const labels = {
      BAC: 'Bacalaureat',
      EN: 'Evaluarea Națională clasa a VIII-a',
      ADMITERE: 'Admitere liceu',
      TEZE: 'Teze semestriale'
    };
    return labels[level as keyof typeof labels] || level;
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${exam.name} — Calendar complet cu toate fazele`}
        description={`Calendar detaliat ${exam.name}: înscrieri, probe, rezultate și toate termenele importante.`}
      />

      <div className="container py-8 space-y-8">
        <header className="text-center space-y-4">
          <nav className="text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">Acasă</a>
            <span className="mx-2">→</span>
            <a href="/examene" className="hover:text-primary">Examene</a>
            <span className="mx-2">→</span>
            <span>{exam.name}</span>
          </nav>
          
          <div className="flex items-center justify-center gap-3">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">
              {exam.name}
            </h1>
          </div>
          
          <p className="text-xl text-muted-foreground">
            {getLevelLabel(exam.level)} • {exam.year}
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            <ExamTimeline exam={exam} phases={phases} />

            <div className="flex items-center gap-4">
              {exam.official_ref && (
                <Button variant="outline" asChild>
                  <a 
                    href={exam.official_ref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Sursă oficială
                  </a>
                </Button>
              )}
            </div>

            <HolidaysAdRail placement="content" />
          </div>

          <aside className="space-y-6">
            <div className="sticky top-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Informații</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tip:</span>
                    <span className="ml-2 font-medium">{getLevelLabel(exam.level)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">An:</span>
                    <span className="ml-2 font-medium">{exam.year}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Faze:</span>
                    <span className="ml-2 font-medium">{phases.length}</span>
                  </div>
                </div>
              </div>
              
              <HolidaysAdRail placement="sidebar" />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}