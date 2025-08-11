import { format } from "date-fns";
import { Badge } from "@/components/Badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/Card";
import CountdownTimer from "@/components/CountdownTimer";
import FollowButton from "@/components/FollowButton";
import ReminderButton from "@/components/ReminderButton";
import AffiliateButton from "@/components/AffiliateButton";

export interface EventCardProps {
  title: string;
  datetime: Date | string | number;
  category?: string;
  affiliateUrl?: string;
}

export default function EventCard({ title, datetime, category, affiliateUrl }: EventCardProps) {
  const date = new Date(datetime);
  return (
    <Card className="hover-scale">
      <CardHeader>
        <div className="flex items-center gap-2">
          {category && <Badge>{category}</Badge>}
        </div>
        <CardTitle className="text-2xl sm:text-3xl">{title}</CardTitle>
        <CardDescription>
          {format(date, "PPP p")} • Timp rămas mai jos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CountdownTimer target={date} />
        <div className="flex flex-wrap gap-2">
          <FollowButton />
          <ReminderButton when={date} />
          {affiliateUrl && <AffiliateButton href={affiliateUrl}>Cumpără bilete</AffiliateButton>}
        </div>
      </CardContent>
    </Card>
  );
}
