import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function ChannelHero({ channel }: { channel: any }) {
  if (!channel) return null;
  return (
    <div className="mb-3">
      <div className="text-sm text-muted-foreground">{channel.owner ? `${channel.owner} • `: ''}{channel.website && <a href={channel.website} className="underline" target="_blank" rel="noopener noreferrer">Site oficial</a>}</div>
    </div>
  );
}
