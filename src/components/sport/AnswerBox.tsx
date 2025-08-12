import { renderAnswer } from "@/seo/snippet";

export default function SportAnswerBox({ data }: { data: { homeTeam?: string; awayTeam?: string; startDate?: Date | string | number; channels?: string[] } }) {
  const text = renderAnswer('match', data);
  if (!text) return null;
  return (
    <div role="note" aria-label="Răspuns scurt" className="rounded-md border bg-card px-3 py-2 text-sm">
      {text}
    </div>
  );
}
