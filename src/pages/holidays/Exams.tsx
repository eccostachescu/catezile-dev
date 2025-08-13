import { useEffect, useState } from "react";
import { GraduationCap, Calendar } from "lucide-react";
import { ExamCard } from "@/components/holidays/ExamCard";
import { HolidaysAdRail } from "@/components/holidays/HolidaysAdRail";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/seo/SEO";

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const loadExams = async () => {
      try {
        const { data } = await supabase
          .from('exam')
          .select(`
            *,
            phases:exam_phase (*)
          `)
          .in('year', [currentYear, currentYear + 1])
          .order('year', { ascending: false });
        
        setExams(data || []);
      } catch (error) {
        console.error('Error loading exams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExams();
  }, [currentYear]);

  // Group exams by level
  const examsByLevel = exams.reduce((acc: any, exam: any) => {
    if (!acc[exam.level]) {
      acc[exam.level] = [];
    }
    acc[exam.level].push(exam);
    return acc;
  }, {});

  const levelOrder = ['BAC', 'EN', 'ADMITERE', 'TEZE'];
  const levelLabels = {
    BAC: 'Bacalaureat',
    EN: 'Evaluarea Națională clasa a VIII-a',
    ADMITERE: 'Admitere liceu',
    TEZE: 'Teze semestriale'
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`Examene naționale ${currentYear} — BAC, Evaluarea Națională, Admitere`}
        description={`Calendar complet examene naționale ${currentYear}: Bacalaureat, Evaluarea Națională clasa a VIII-a, admitere liceu. Termene înscrieri, probe, rezultate.`}
      />

      <div className="container py-8 space-y-8">
        <header className="text-center space-y-4">
          <nav className="text-sm text-muted-foreground">
            <a href="/" className="hover:text-primary">Acasă</a>
            <span className="mx-2">→</span>
            <a href="/sarbatori" className="hover:text-primary">Sărbători</a>
            <span className="mx-2">→</span>
            <span>Examene</span>
          </nav>
          
          <h1 className="text-4xl font-bold">
            Examene naționale {currentYear}
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Calendar complet: BAC, Evaluarea Națională, admitere liceu și teze
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-3 space-y-8">
            {loading ? (
              <div className="text-center py-12">Se încarcă examenele...</div>
            ) : (
              <div className="space-y-8">
                {levelOrder.map(level => {
                  const levelExams = examsByLevel[level];
                  if (!levelExams?.length) return null;

                  return (
                    <section key={level}>
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6" />
                        {levelLabels[level as keyof typeof levelLabels]}
                      </h2>
                      
                      <div className="grid gap-6 md:grid-cols-2">
                        {levelExams.map((exam: any) => (
                          <ExamCard 
                            key={exam.id}
                            exam={exam}
                            phases={exam.phases || []}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}

                {exams.length === 0 && (
                  <div className="text-center py-12">
                    <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nu sunt examene disponibile</h3>
                    <p className="text-muted-foreground">
                      Examenele pentru {currentYear} nu au fost încă programate.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className="sticky top-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Acces rapid
                </h3>
                <div className="space-y-2">
                  <a 
                    href="/sarbatori"
                    className="block text-sm hover:text-primary transition-colors"
                  >
                    Sărbători legale
                  </a>
                  <a 
                    href="/calendar-scolar"
                    className="block text-sm hover:text-primary transition-colors"
                  >
                    Calendar școlar
                  </a>
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