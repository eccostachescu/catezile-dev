import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/auth";
import { toast } from "@/components/ui/use-toast";
import AvatarUploader from "@/components/common/AvatarUploader";

export default function ProfileTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [locale, setLocale] = useState("ro-RO");
  const [timezone, setTimezone] = useState("Europe/Bucharest");
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await supabase.from('profile').select('*').eq('id', user.id).maybeSingle();
      if (data) {
        setDisplayName(data.display_name ?? "");
        setHandle(data.handle ?? "");
        setLocale(data.locale ?? "ro-RO");
        setTimezone(data.timezone ?? "Europe/Bucharest");
        setAvatarPath(data.avatar_url ?? null);
      }
      setLoading(false);
    }
    load();
  }, [user?.id]);

  const validateHandle = async () => {
    if (!handle) return true;
    const ok = /^[a-zA-Z0-9_]{3,20}$/.test(handle);
    if (!ok) { toast({ title: "Handle invalid", description: "3–20 caractere: litere, cifre sau _" }); return false; }
    const { data } = await supabase.from('profile').select('id').eq('handle', handle).neq('id', user!.id).maybeSingle();
    if (data) { toast({ title: "Handle ocupat", description: "Alege altul." }); return false; }
    return true;
  };

  const onSave = async () => {
    if (!user) return;
    if (!(await validateHandle())) return;
    setSaving(true);
    const { error } = await supabase.from('profile').update({
      display_name: displayName || null,
      handle: handle || null,
      locale, timezone,
      avatar_url: avatarPath,
    }).eq('id', user.id);
    setSaving(false);
    if (error) toast({ title: "Eroare la salvare", description: error.message });
    else toast({ title: "Salvat", description: "Profil actualizat." });
  };

  if (loading) return <p>Se încarcă...</p>;

  return (
    <section className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Avatar</label>
        <AvatarUploader value={avatarPath} onChange={setAvatarPath} />
      </div>
      <div>
        <label className="block text-sm mb-1">Nume afișat</label>
        <Input value={displayName} onChange={(e)=>setDisplayName(e.target.value)} placeholder="ex. Andrei" />
      </div>
      <div>
        <label className="block text-sm mb-1">Handle</label>
        <Input value={handle} onChange={(e)=>setHandle(e.target.value)} placeholder="ex. prenume" onBlur={validateHandle} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Limbă</label>
          <Input value={locale} onChange={(e)=>setLocale(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm mb-1">Fus orar</label>
          <Input value={timezone} onChange={(e)=>setTimezone(e.target.value)} />
        </div>
      </div>
      <Button onClick={onSave} disabled={saving}>Salvează</Button>
    </section>
  );
}
