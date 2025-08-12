import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ReactNode, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !session) {
      toast({ title: "Autentificare necesară", description: "Conectează-te pentru a accesa această pagină." });
    }
  }, [loading, session]);

  if (loading) return null;
  if (!session) return (
    <Navigate to={`/auth/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />
  );
  return <>{children}</>;
}
