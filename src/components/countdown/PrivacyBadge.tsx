export default function PrivacyBadge({ privacy }: { privacy: 'PUBLIC'|'UNLISTED'|'PRIVATE'|string }) {
  const label = privacy === 'PUBLIC' ? 'Public' : privacy === 'UNLISTED' ? 'Nelistat' : 'Privat';
  return (
    <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-muted-foreground" title="Cine poate vedea acest countdown">
      {label}
    </span>
  );
}
