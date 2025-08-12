export default function ThemePreview({ theme }: { theme?: any }) {
  if (!theme) return null;
  const primary = theme?.primary || 'hsl(var(--primary))';
  const bg = theme?.background || 'hsl(var(--background))';
  const fg = theme?.foreground || 'hsl(var(--foreground))';
  return (
    <div className="mt-2 text-xs" aria-label="Previzualizare temă">
      <div className="flex items-center gap-2">
        <span className="inline-block w-5 h-5 rounded-sm border" style={{ background: primary }} />
        <span className="inline-block w-5 h-5 rounded-sm border" style={{ background: bg }} />
        <span className="inline-block w-5 h-5 rounded-sm border" style={{ background: fg }} />
      </div>
    </div>
  );
}
