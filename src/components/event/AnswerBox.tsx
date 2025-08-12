import { renderAnswer } from "@/seo/snippet";

export default function AnswerBox({ kind = 'event', data }: { kind?: 'event'; data: any }) {
  const text = renderAnswer(kind, data);
  if (!text) return null;
  return (
    <div role="note" aria-label="Răspuns scurt" className="rounded-md border bg-card px-3 py-2 text-sm">
      {text}
    </div>
  );
}
