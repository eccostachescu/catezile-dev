import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock } from "lucide-react";

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "Cum să nu ratezi niciodată un eveniment important",
      excerpt: "Descoperă strategiile și trucurile pentru a fi mereu la curent cu evenimentele care contează pentru tine.",
      date: "2024-01-20",
      readTime: "5 min",
      category: "Ghiduri",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Top 10 sărbători românești în 2024",
      excerpt: "O trecere în revistă a celor mai importante sărbători și tradiții românești din acest an.",
      date: "2024-01-18",
      readTime: "8 min",
      category: "Cultură",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Organizarea evenimentelor: de la planificare la execuție",
      excerpt: "Ghid complet pentru organizarea de succes a evenimentelor, de la concepte simple la cele complexe.",
      date: "2024-01-15",
      readTime: "12 min",
      category: "Business",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Istoria sărbătorilor: de ce celebrăm",
      excerpt: "Explorează originile și semnificația sărbătorilor pe care le celebrăm astăzi.",
      date: "2024-01-12",
      readTime: "7 min",
      category: "Istorie",
      image: "/placeholder.svg"
    }
  ];

  const categories = ["Toate", "Ghiduri", "Cultură", "Business", "Istorie", "Tehnologie"];

  return (
    <>
      <SEO 
        title="Blog CateZile" 
        description="Articole utile despre evenimente, sărbători, organizare și mult mai mult"
        path="/blog" 
      />
      <Container>
        <div className="max-w-6xl mx-auto py-8 space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold">Blog</h1>
            <p className="text-lg text-muted-foreground">
              Articole utile despre evenimente, sărbători și organizare
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge 
                key={category} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
              >
                {category}
              </Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                <div className="h-48 bg-muted"></div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{post.category}</Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {post.readTime}
                    </div>
                  </div>
                  <h2 className="text-lg font-semibold line-clamp-2">{post.title}</h2>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.date).toLocaleDateString('ro-RO')}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center space-y-4">
            <h2 className="text-xl font-semibold">Vrei să contribui?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dacă ai o idee pentru un articol sau vrei să împărtășești experiența ta cu comunitatea, 
              ne-ar face plăcere să auzim de la tine!
            </p>
            <a href="/contact" className="inline-block text-primary hover:underline">
              Contactează-ne →
            </a>
          </div>
        </div>
      </Container>
    </>
  );
}