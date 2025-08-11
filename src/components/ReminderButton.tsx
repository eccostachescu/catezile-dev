import { useState } from "react";
import { Button } from "@/components/Button";
import { Bell } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

export default function ReminderButton({ when }: { when: Date | string | number }) {
  const [set, setSet] = useState(false);
  return (
    <Button
      variant={set ? "secondary" : "default"}
      onClick={() => {
        setSet(true);
        toast({ title: "Reminder setat", description: "Îți vom reaminti cu 24h înainte." });
      }}
      aria-pressed={set}
    >
      <Bell />
      {set ? "Reminder activ" : "Setează reminder"}
    </Button>
  );
}
