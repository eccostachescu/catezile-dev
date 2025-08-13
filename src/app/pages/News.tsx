import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function News() {
  const news = [
    {
      id: 1,
      title: "Noua funcționalitate: Notificări SMS",
      excerpt: "Acum poți primi notificări prin SMS pentru evenimentele tale favorite.",
      date: "2024-01-15",
      category: "Funcționalitate nouă",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Widget-uri îmbunătățite pentru site-uri",
      excerpt: "Am îmbunătățit widget-urile pentru o integrare mai ușoară în site-ul tău.",
      date: "2024-01-10",
      category: "Îmbunătățire",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Integrare cu calendarul Google",
      excerpt: "Sincronizează evenimentele direct cu calendarul tău Google.",
      date: "2024-01-05",
      category: "Integrare",
      image: "/placeholder.svg"
    }
  ];

  return (
    <>
      <SEO 
        title="Noutăți CateZile" 
        description="Rămâi la curent cu ultimele noutăți și funcționalități ale platformei CateZile"
        path="/noutati" 
      />
      <Container>
        <div className="max-w-4xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Noutăți</h1>
            <p className="text-lg text-muted-foreground">
              Rămâi la curent cu ultimele funcționalități și îmbunătățiri
            </p>
          </div>

          <div className="space-y-6">
            {news.map((article) => (
              <Card key={article.id} className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-32 h-32 bg-muted rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{article.category}</Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(article.date).toLocaleDateString('ro-RO')}
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold">{article.title}</h2>
                    <p className="text-muted-foreground">{article.excerpt}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <p className="text-muted-foreground">
              Urmărește-ne pe rețelele sociale pentru cele mai recente actualizări!
            </p>
          </div>
        </div>
      </Container>
    </>
  );
}