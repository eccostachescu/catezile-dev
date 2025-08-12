import { Button } from "@/components/Button";
import FollowButton from "@/components/FollowButton";
import ReminderButton from "@/components/ReminderButton";
import { Share2 } from "lucide-react";
import { track } from "@/lib/analytics";

export default function ActionsBar({ url, cinemaDate, netflixDate, primeDate }: { url: string; cinemaDate?: string | null; netflixDate?: string | null; primeDate?: string | null }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {cinemaDate && <ReminderButton when={cinemaDate} />}
      {netflixDate && <ReminderButton when={netflixDate} />}
      {primeDate && <ReminderButton when={primeDate} />}
      <FollowButton />
      <Button
        variant="outline"
        onClick={async () => {
          try {
            if (navigator.share) {
              await navigator.share({ url });
            } else {
              await navigator.clipboard.writeText(url);
            }
            track('share_click', { url });
          } catch {}
        }}
      >
        <Share2 />
        Share
      </Button>
    </div>
  );
}
