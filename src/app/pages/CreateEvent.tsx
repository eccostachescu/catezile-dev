import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import EventCreateForm from "@/components/ugc/EventCreateForm";
import SuccessPanel from "@/components/ugc/SuccessPanel";

export default function CreateEvent() {
  const navigate = useNavigate();
  const [success, setSuccess] = useState<{ id: string } | null>(null);

  if (success) {
    return (
      <>
        <SEO title="Eveniment trimis pentru moderare" noindex />
        <Container className="py-12">
          <SuccessPanel
            id={success.id}
          />
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO 
        title="Adaugă un eveniment nou"
        description="Trimite un eveniment pentru a fi inclus în calendarul nostru. Concerte, festivaluri, conferințe și multe altele."
      />
      
      <Container className="py-8">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Adaugă un eveniment</h1>
            <p className="text-muted-foreground text-lg">
              Contribuie la calendarul nostru de evenimente din România. 
              Toate evenimentele sunt moderate înainte de publicare.
            </p>
          </header>

          <EventCreateForm onSuccess={setSuccess} />
        </div>
      </Container>
    </>
  );
}