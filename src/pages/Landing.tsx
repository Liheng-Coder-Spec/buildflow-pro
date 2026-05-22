import * as React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  HardHat,
  Network,
  ShieldCheck,
  Sparkles,
  TimerReset
} from "lucide-react";

const LANDING_METRICS = [
  { label: "Active project control", value: "360°" },
  { label: "Enterprise workflows", value: "18+" },
  { label: "Field to finance visibility", value: "Live" }
];

const CAPABILITIES = [
  {
    icon: ClipboardList,
    label: "Construction execution",
    text: "Tasks, daily reports, RFIs, transmittals, quality, and HSE aligned around live project work."
  },
  {
    icon: BarChart3,
    label: "Executive command",
    text: "Progress, cost, approvals, and risk signals shaped for managers who need fast decisions."
  },
  {
    icon: Network,
    label: "Connected enterprise",
    text: "Procurement, finance, HR, documents, and project governance operating from one source of truth."
  }
];

const WORKFLOW_STEPS = [
  "Plan scope",
  "Assign teams",
  "Track field work",
  "Approve cost",
  "Report performance"
];

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-primary-deep text-primary-foreground">
      <section className="relative min-h-[92vh] px-4 py-5 sm:px-6 lg:px-8">
        <img
          src="/landing-highrise.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-45"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-deep via-primary-deep/80 to-primary/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-deep via-primary-deep/20 to-transparent" />
        <div className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full border border-accent/25 opacity-70 motion-safe:animate-[spin_28s_linear_infinite]" />
        <div className="absolute left-[12%] top-[28%] h-28 w-px bg-accent/60 motion-safe:animate-pulse" />
        <div className="absolute bottom-28 right-[10%] h-36 w-px bg-primary-foreground/35 motion-safe:animate-pulse" />

        <div className="relative z-10 mx-auto flex min-h-[86vh] max-w-7xl flex-col">
          <header className="flex items-center justify-between gap-4">
            <Link to="/landing" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground shadow-elevated">
                <HardHat className="h-6 w-6" />
              </span>
              <span className="flex flex-col leading-none">
                <span className="text-lg font-bold">BuildTrack</span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground/65">
                  Construction OS
                </span>
              </span>
            </Link>
            <nav className="hidden items-center gap-6 text-sm text-primary-foreground/75 md:flex">
              <a href="#platform" className="hover:text-primary-foreground">Platform</a>
              <a href="#workflow" className="hover:text-primary-foreground">Workflow</a>
              <a href="#enterprise" className="hover:text-primary-foreground">Enterprise</a>
            </nav>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/auth">
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </header>

          <div className="grid flex-1 items-center gap-10 py-14 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-10">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/85 backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-accent" />
                Built for enterprise construction control
              </div>
              <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-normal sm:text-6xl lg:text-7xl">
                Digital Construction Operating System
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-primary-foreground/78">
                A dynamic command center for high-rise projects, infrastructure teams, and enterprise builders who need every task, cost, document, and approval visible in real time.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/auth">
                    Enter platform
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/15 hover:text-primary-foreground"
                >
                  <a href="#platform">View capabilities</a>
                </Button>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="rounded-lg border border-primary-foreground/18 bg-primary-deep/65 p-5 shadow-elevated backdrop-blur-xl">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-primary-foreground">Enterprise pulse</p>
                    <p className="text-xs text-primary-foreground/55">High-rise delivery status</p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-success-soft text-success">
                    <CheckCircle2 className="h-5 w-5" />
                  </span>
                </div>
                <div className="space-y-4">
                  {LANDING_METRICS.map((metric) => (
                    <div key={metric.label} className="rounded-md border border-primary-foreground/10 bg-primary-foreground/10 p-4">
                      <div className="flex items-end justify-between gap-4">
                        <span className="text-sm text-primary-foreground/65">{metric.label}</span>
                        <span className="text-2xl font-bold text-primary-foreground">{metric.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="platform" className="bg-background px-4 py-16 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex max-w-3xl flex-col gap-3">
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Platform depth</p>
            <h2 className="text-3xl font-bold sm:text-4xl">One enterprise layer for project delivery.</h2>
            <p className="text-muted-foreground">
              BuildTrack brings field teams, commercial teams, and executives into the same operating rhythm.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <article key={item.label} className="rounded-lg border bg-card p-6 shadow-card">
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <item.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold">{item.label}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-secondary px-4 py-16 text-foreground sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[360px_minmax(0,1fr)]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Dynamic workflow</p>
            <h2 className="mt-3 text-3xl font-bold">From plan to executive report.</h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              A clear delivery path connects construction activity to cost, compliance, and leadership visibility.
            </p>
          </div>
          <div className="grid gap-3 md:grid-cols-5">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step} className="relative rounded-lg border bg-card p-4 shadow-card">
                <div className="mb-8 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <TimerReset className="h-4 w-4 text-accent" />
                </div>
                <p className="text-sm font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enterprise" className="bg-primary-deep px-4 py-14 text-primary-foreground sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-3 text-accent">
              <Building2 className="h-5 w-5" />
              <ShieldCheck className="h-5 w-5" />
              <BarChart3 className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-bold">Ready for enterprise construction teams.</h2>
            <p className="mt-3 text-sm leading-6 text-primary-foreground/70">
              Govern complex projects with audit-ready workflows, role-based access, and operational dashboards built for repeated daily use.
            </p>
          </div>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/auth">
              Sign in to BuildTrack
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
