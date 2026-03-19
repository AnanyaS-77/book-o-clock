import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

interface Props {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { user, isLoading, isConfigured } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="rounded-3xl border border-border/70 bg-card/70 px-8 py-10 text-center shadow-xl shadow-black/10 backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Checking session</p>
          <h1 className="mt-3 text-2xl font-semibold">Loading your shelf...</h1>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
