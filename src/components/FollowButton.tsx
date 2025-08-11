import { useState } from "react";
import { Button } from "@/components/Button";
import { Heart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function FollowButton({ defaultFollowed = false }: { defaultFollowed?: boolean }) {
  const [followed, setFollowed] = useState(defaultFollowed);
  return (
    <Button
      variant={followed ? "secondary" : "outline"}
      aria-pressed={followed}
      onClick={() => {
        setFollowed((f) => !f);
        toast({ title: followed ? "Nu mai urmărești" : "Urmărești acum", description: "Vei vedea actualizări pentru acest subiect." });
      }}
    >
      <Heart className={followed ? "fill-current" : ""} />
      {followed ? "Urmărit" : "Urmărește"}
    </Button>
  );
}
