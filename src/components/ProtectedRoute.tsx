import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { ReactNode, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !isAdmin) {
      toast({ title: "Acces restricționat", description: "Ai nevoie de drepturi de admin." });
    }
  }, [loading, isAdmin]);

  if (loading) return null;
  if (!isAdmin) return <Navigate to="/" state={{ from: location }} replace />;
  return <>{children}</>;
}
