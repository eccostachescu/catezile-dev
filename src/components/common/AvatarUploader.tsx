import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/Button";

export default function AvatarUploader({ value, onChange }: { value: string | null, onChange: (v: string | null) => void }) {
  const { user } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!value) { setPreviewUrl(null); return; }
      const { data } = await supabase.storage.from('avatars').createSignedUrl(value, 60 * 60);
      setPreviewUrl(data?.signedUrl || null);
    }
    load();
  }, [value]);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) { alert('Max 2MB'); return; }
    const path = `${user.id}/avatar.${file.type.includes('png') ? 'png' : 'jpg'}`;
    setUploading(true);
    await supabase.storage.from('avatars').upload(path, file, { upsert: true, contentType: file.type });
    setUploading(false);
    onChange(path);
  };

  return (
    <div className="flex items-center gap-3">
      <img src={previewUrl || "/placeholder.svg"} alt="Avatar utilizator" className="h-16 w-16 rounded-full object-cover border" />
      <label className="text-sm">
        <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onFile} />
        <Button type="button" onClick={() => (document.querySelector<HTMLInputElement>('input[type=file]')?.click())} disabled={uploading}>
          {uploading ? 'Se încarcă...' : 'Încarcă' }
        </Button>
      </label>
    </div>
  );
}
