import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '@/seo/SEO';
import Container from '@/components/Container';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function TVShow() {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Serial TV — Detalii nu sunt disponibile"
        description="Pagina de detalii pentru seriale TV nu este încă implementată."
        path="/tv/show"
      />
      
      <Container className="py-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Serial not found</h1>
          <p className="text-muted-foreground mb-6">
            Detaliile pentru seriale TV nu sunt încă disponibile. Această funcționalitate va fi implementată în curând.
          </p>
          <Button onClick={() => navigate('/tv')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to TV Shows
          </Button>
        </div>
      </Container>
    </>
  );
}