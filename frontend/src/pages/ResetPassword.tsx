import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, KeyRound, Loader2 } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, isLoading, isConfigured } = useAuth();

  if (!isLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isConfigured) {
      toast({
        title: "Supabase not configured",
        description: "Add your Supabase env vars before testing password reset.",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Choose a password with at least 6 characters.",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Double-check both password fields and try again.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      toast({
        title: "Password updated",
        description: "Your password has been reset. You can now sign in normally.",
      });
      navigate("/auth", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to reset your password.";
      toast({
        title: "Password reset failed",
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 gradient-mesh opacity-80" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "linear-gradient(135deg, hsl(270 80% 65% / 0.18), hsl(220 90% 60% / 0.12), hsl(330 80% 60% / 0.08))",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-3xl items-center px-6 py-14">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full rounded-[2rem] border border-white/10 bg-card/75 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl"
        >
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl transition hover:border-primary hover:bg-card"
          >
            <BookOpen className="h-4 w-4" />
            Back to sign in
          </Link>

          <div className="mt-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
              <KeyRound className="h-4 w-4" />
              Password recovery
            </div>
            <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-white">
              Set a new password
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Choose a strong new password for your account, then head back to sign in.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Re-enter your password"
                minLength={6}
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full rounded-2xl text-base"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Save New Password
                </>
              )}
            </Button>
          </form>
        </motion.section>
      </div>
    </div>
  );
};

export default ResetPassword;
