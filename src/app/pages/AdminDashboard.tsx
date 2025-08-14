import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  return (
    <>
      <SEO title="Admin Dashboard" path="/admin" noIndex />
      <Container>
        <div className="space-y-6">
          <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evenimente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Administrează evenimente și moderare</p>
                <Button asChild className="w-full">
                  <Link to="/admin/events">Vezi Evenimente</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Metrici</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Statistici și analiză</p>
                <Button asChild className="w-full">
                  <Link to="/admin/metrics">Vezi Metrici</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Securitate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Setări de securitate și moderare</p>
                <Button asChild className="w-full">
                  <Link to="/admin/security">Securitate</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Căutare</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Administrare căutare și indexare</p>
                <Button asChild className="w-full">
                  <Link to="/admin/search">Căutare</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deploying</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Deploy și management aplicație</p>
                <Button asChild className="w-full">
                  <Link to="/admin/deploy">Deploy</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email-uri</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">Management email și notificări</p>
                <Button asChild className="w-full">
                  <Link to="/admin/emails">Email-uri</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </>
  );
}
