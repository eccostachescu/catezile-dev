import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function FAQBlock({ faq, fallback }: { faq?: Array<{ question: string; answer: string }>; fallback: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<string | undefined>(undefined);
  const items = (faq && faq.length ? faq.map((x: any, i: number) => ({ id: String(i+1), q: x.question, a: x.answer })) : fallback.map((x, i) => ({ id: String(i+1), q: x.q, a: x.a })));
  return (
    <section aria-labelledby="faq">
      <h2 id="faq" className="text-xl font-semibold mb-2">Întrebări frecvente</h2>
      <Accordion type="single" collapsible value={open} onValueChange={setOpen}>
        {items.map((it) => (
          <AccordionItem key={it.id} value={it.id}>
            <AccordionTrigger onClick={() => { /* analytics could go here */ }}>{it.q}</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{it.a}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
