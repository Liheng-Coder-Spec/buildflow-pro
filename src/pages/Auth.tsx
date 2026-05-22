import * as React from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  HardHat,
  Loader2,
  Send,
  ShieldCheck
} from "lucide-react";
import { ORG_REGISTRY, ORG_DEPT_LABELS, DEMO_PASSWORD } from "@/lib/orgMeta";

const signInSchema = z.object({
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(72),
});

const signUpSchema = signInSchema.extend({
  fullName: z.string().trim().min(2, { message: "Full name is required" }).max(100),
});

const DEMO_ACCOUNTS = ORG_REGISTRY.map((m) => ({
  email: m.email,
  name: m.full_name,
  role: `${ORG_DEPT_LABELS[m.department]} - ${m.position}`,
}));

const BRAND_METRICS = [
  { label: "Project Control", value: "Live", icon: Activity },
  { label: "Risk & Safety", value: "Tracked", icon: ShieldCheck },
  { label: "Cost Visibility", value: "360", icon: BarChart3 },
];

const ACTION_FLOW = [
  { label: "Site report", icon: ClipboardCheck },
  { label: "Approval", icon: FileCheck2 },
  { label: "Executive view", icon: Send },
];

export default function Auth() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = React.useState(false);
  const [tab, setTab] = React.useState<"signin" | "signup">("signin");

  React.useEffect(() => {
    if (!authLoading && user) navigate("/", { replace: true });
  }, [user, authLoading, navigate]);

  const onSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: result.data.email,
      password: result.data.password,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Signed in");
    navigate("/", { replace: true });
  };

  const fillDemoCredentials = (email: string) => {
    const emailInput = document.getElementById("signin-email") as HTMLInputElement;
    const passwordInput = document.getElementById("signin-password") as HTMLInputElement;
    if (emailInput && passwordInput) {
      emailInput.value = email;
      passwordInput.value = DEMO_PASSWORD;
      passwordInput.focus();
    }
  };

  const onSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = signUpSchema.safeParse({
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: result.data.email,
      password: result.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { full_name: result.data.fullName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created. You can sign in now.");
    setTab("signin");
  };

  const onForgotPassword = async () => {
    const email = (document.getElementById("signin-email") as HTMLInputElement)?.value;
    if (!email) {
      toast.error("Enter your email above first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) toast.error(error.message);
    else toast.success("Password reset email sent");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_minmax(420px,560px)] bg-background">
      <h1 className="sr-only">BuildTrack - Sign in</h1>

      <div className="relative hidden min-h-screen overflow-hidden lg:flex flex-col justify-between bg-gradient-primary text-primary-foreground p-8">
        <img
          src="/landing-highrise.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-35 motion-safe:animate-[auth-hero-drift_18s_ease-in-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deep/85 to-primary/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-transparent to-primary-deep/30" />
        <div className="absolute left-10 top-32 h-40 w-px bg-accent/70 motion-safe:animate-pulse" />
        <div className="absolute right-16 top-24 h-24 w-px bg-primary-foreground/45 motion-safe:animate-pulse" />
        <div className="absolute bottom-36 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full border border-accent/25 motion-safe:animate-[spin_26s_linear_infinite]" />
        <div className="absolute left-0 top-[22%] h-px w-full bg-gradient-to-r from-transparent via-accent/70 to-transparent motion-safe:animate-[auth-scan_5s_ease-in-out_infinite]" />
        <div className="absolute bottom-24 left-8 right-8 h-px overflow-hidden bg-primary-foreground/10">
          <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-accent to-transparent motion-safe:animate-[auth-data-line_3.8s_linear_infinite]" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-elevated">
            <HardHat className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">BuildTrack</span>
        </div>

        <div className="relative z-10 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/85 backdrop-blur-md">
            <Building2 className="h-4 w-4 text-accent" />
            Enterprise high-rise construction platform
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Digital Construction Operating System Control, end-to-end.
          </h1>
          <p className="text-base text-primary-foreground/80">
            Tasks, timesheets, approvals, and audit-ready reporting - built for
            project managers, engineers, and supervisors who need the truth
            about their job sites.
          </p>

          <div className="grid max-w-2xl grid-cols-3 gap-3 pt-2">
            {BRAND_METRICS.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-primary-foreground/15 bg-primary-foreground/10 p-4 backdrop-blur-md motion-safe:animate-[auth-float_7s_ease-in-out_infinite]"
              >
                <div className="mb-5 flex items-center justify-between">
                  <metric.icon className="h-4 w-4 text-accent" />
                  <CheckCircle2 className="h-4 w-4 text-success-soft" />
                </div>
                <p className="text-lg font-bold">{metric.value}</p>
                <p className="mt-1 text-xs text-primary-foreground/65">{metric.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-primary-foreground/15 bg-primary-deep/45 p-4 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-primary-foreground/85">Live delivery flow</p>
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
              </span>
            </div>
            <div className="grid grid-cols-[1fr_24px_1fr_24px_1fr] items-center gap-2">
              {ACTION_FLOW.map((step, index) => (
                <React.Fragment key={step.label}>
                  <div
                    className="rounded-md border border-primary-foreground/12 bg-primary-foreground/10 p-3 motion-safe:animate-[auth-rise_4.5s_ease-in-out_infinite]"
                    style={{ animationDelay: `${index * 450}ms` }}
                  >
                    <step.icon className="mb-3 h-4 w-4 text-accent" />
                    <p className="text-xs font-semibold text-primary-foreground/85">{step.label}</p>
                  </div>
                  {index < ACTION_FLOW.length - 1 && (
                    <div className="h-px overflow-hidden bg-primary-foreground/15">
                      <div
                        className="h-full w-full bg-accent motion-safe:animate-[auth-link_2s_ease-in-out_infinite]"
                        style={{ animationDelay: `${index * 500}ms` }}
                      />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/60">
          (c) {new Date().getFullYear()} BuildTrack. Internal company use.
        </div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <HardHat className="h-5 w-5" />
            </div>
            <span className="font-bold">BuildTrack</span>
          </div>

          <Card className="border-border shadow-elevated">
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
              <CardDescription>Sign in to your account or request access from your admin.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={tab} onValueChange={(v) => setTab(v as "signin" | "signup")}>
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="signin">Sign in</TabsTrigger>
                  <TabsTrigger value="signup">Sign up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={onSignIn} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input id="signin-email" name="email" type="email" required autoComplete="email" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password">Password</Label>
                        <button
                          type="button"
                          onClick={onForgotPassword}
                          className="text-xs text-muted-foreground hover:text-primary underline-offset-2 hover:underline"
                        >
                          Forgot?
                        </button>
                      </div>
                      <Input id="signin-password" name="password" type="password" required autoComplete="current-password" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Sign in
                    </Button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Demo Accounts</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {DEMO_ACCOUNTS.map((account) => (
                        <button
                          key={account.email}
                          type="button"
                          onClick={() => fillDemoCredentials(account.email)}
                          className="w-full text-left p-2.5 rounded-md bg-muted/50 hover:bg-muted transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{account.name}</p>
                              <p className="text-xs text-muted-foreground">{account.email}</p>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">{account.role}</Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 text-center">Password for all: <span className="font-mono font-medium text-foreground">{DEMO_PASSWORD}</span></p>
                  </div>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={onSignUp} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full name</Label>
                      <Input id="signup-name" name="fullName" type="text" required maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input id="signup-email" name="email" type="email" required maxLength={255} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input id="signup-password" name="password" type="password" required minLength={6} maxLength={72} />
                      <p className="text-xs text-muted-foreground">
                        New accounts start as <span className="font-medium">Worker</span>. An admin can change your role.
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Create account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
