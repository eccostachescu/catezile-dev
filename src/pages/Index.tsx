import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Evenimente în România
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descoperă evenimente, filme, meciuri de fotbal și sărbători din România. 
            Planifică-ți timpul și nu rata momentele importante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Evenimente</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Concerte, festivaluri, conferințe și multe altele
              </p>
              <Button asChild className="w-full">
                <Link to="/evenimente">Vezi Evenimente</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Filme</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Lansări cinema și streaming în România
              </p>
              <Button asChild className="w-full">
                <Link to="/filme">Vezi Filme</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Sport</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Meciuri de fotbal și alte sporturi
              </p>
              <Button asChild className="w-full">
                <Link to="/sport">Vezi Sport</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Sărbători</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Sărbători legale și calendar școlar
              </p>
              <Button asChild className="w-full">
                <Link to="/sarbatori">Vezi Sărbători</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Card className="inline-block">
            <CardHeader>
              <CardTitle>Populează cu Date</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Importă date pentru evenimente, filme, sport și sărbători
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/import">Dashboard Import</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/populate">Populare Rapidă</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/sample">Date Test</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
