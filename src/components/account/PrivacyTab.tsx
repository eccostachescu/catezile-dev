import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/components/ui/use-toast";

export default function PrivacyTab() {
  const { signOut } = useAuth();

  const exportData = async () => {
    const { data, error } = await supabase.functions.invoke('export_my_data', { body: {} });
    if (error) { toast({ title: 'Eroare export', description: error.message }); return; }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `catezile_export_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
  };

  const deleteAccount = async () => {
    const confirm1 = window.prompt('Tastează STERGERE pentru a confirma ștergerea contului');
    if (confirm1 !== 'STERGERE') return;
    const { error } = await supabase.functions.invoke('delete_my_account', { body: {} });
    if (error) { toast({ title: 'Eroare', description: error.message }); return; }
    toast({ title: 'Cont șters', description: 'Ne pare rău să te vedem plecând.' });
    await signOut();
    window.location.href = '/';
  };

  const unsubscribeMarketing = async () => {
    // Simplu: setează marketing_emails=false
    const { error } = await supabase.from('user_settings').update({ marketing_emails: false }).neq('marketing_emails', false);
    if (error) toast({ title: 'Eroare', description: error.message });
    else toast({ title: 'Dezabonat', description: 'Nu vei mai primi e-mailuri de marketing.' });
  };

  return (
    <section className="space-y-3">
      <Button onClick={exportData} variant="secondary">Export date (JSON)</Button>
      <Button onClick={unsubscribeMarketing} variant="outline">Dezabonează-mă de la marketing</Button>
      <div className="pt-2">
        <Button onClick={deleteAccount} variant="destructive">Șterge contul</Button>
      </div>
    </section>
  );
}
