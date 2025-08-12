import { routes } from "@/app/routes";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function FollowChannelButton({ channelId }: { channelId: string }) {
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;
      const { data } = await supabase.from('follow_channel').select('channel_id').eq('user_id', user.user.id).eq('channel_id', channelId);
      setFollowed((data || []).length > 0);
    })();
  }, [channelId]);

  const toggle = async () => {
    const { data: session } = await supabase.auth.getUser();
    const user = session.user;
    if (!user) {
      window.location.href = routes.authLogin(window.location.pathname);
      return;
    }
    if (followed) {
      await supabase.from('follow_channel').delete().eq('user_id', user.id).eq('channel_id', channelId);
      setFollowed(false);
      toast({ title: 'Nu mai urmărești canalul', description: 'Nu vei mai primi actualizări pentru acest canal.' });
    } else {
      await supabase.from('follow_channel').insert({ user_id: user.id, channel_id: channelId });
      setFollowed(true);
      toast({ title: 'Urmărești canalul', description: 'Vei primi actualizări pentru meciuri pe acest canal.' });
    }
  };

  return (
    <button aria-pressed={followed} onClick={toggle} className={`px-3 py-1 rounded-md border ${followed ? 'bg-secondary' : 'hover:bg-muted'}`}>
      {followed ? 'Urmărit' : 'Urmărește canalul'}
    </button>
  );
}
