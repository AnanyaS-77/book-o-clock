import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2, LogIn, UserPlus } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/AuthProvider";
import { supabase } from "@/lib/supabase";

type AuthMode = "signin" | "signup";

const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isConfigured, isLoading } = useAuth();

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/";

  useEffect(() => {
    if (!isConfigured) {
      toast({
        title: "Supabase setup needed",
        description: "Add your Supabase URL and anon key to enable sign in.",
      });
    }
  }, [isConfigured, toast]);

  if (!isLoading && user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isConfigured) {
      toast({
        title: "Supabase not configured",
        description: "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY before testing auth.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          throw error;
        }

        toast({
          title: "Check your inbox",
          description: "Your account was created. Confirm your email, then sign in.",
        });
        setMode("signin");
        setPassword("");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Welcome back",
        description: "You’re signed in and your personal shelf is ready.",
      });
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong during authentication.";
      toast({
        title: mode === "signup" ? "Unable to create account" : "Unable to sign in",
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

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-14">
        <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="self-center"
          >
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-foreground backdrop-blur-xl transition hover:border-primary hover:bg-card"
            >
              <BookOpen className="h-4 w-4" />
              Back to discovery
            </Link>

            <div className="mt-8 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm text-primary">
                <UserPlus className="h-4 w-4" />
                Product-ready accounts
              </div>
              <h1 className="mt-6 font-display text-5xl font-bold tracking-tight text-white md:text-6xl">
                Sign in to build your own reading universe
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Your shelf, reading progress, reviews, and personalized recommendations should follow you across devices.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-[2rem] border border-white/10 bg-card/75 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl"
          >
            <div className="mb-6 flex rounded-2xl border border-border/70 bg-background/60 p-1">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  mode === "signin" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition ${
                  mode === "signup" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === "signup" && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="How should we greet you?"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
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

              {!isConfigured && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                  Supabase keys are not configured yet, so this form is in setup mode until env vars are added.
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting || !email || !password}
                className="w-full rounded-2xl text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === "signup" ? "Creating account..." : "Signing in..."}
                  </>
                ) : mode === "signup" ? (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Account
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Auth;
