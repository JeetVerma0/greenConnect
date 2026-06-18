import Link from "next/link";
import { Leaf, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IMPACT_STATS } from "@/lib/mock-data";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 lg:px-8">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">GreenConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-primary">Environmental Action Platform</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              Report issues. Join teams. Prove impact.
            </h1>
            <p className="mt-6 text-lg text-text-secondary leading-relaxed">
              GreenConnect connects communities to report environmental problems,
              coordinate cleanup teams, and document real before-and-after change.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg">Log In</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
            <h2 className="text-2xl font-semibold">Community Impact</h2>
            <p className="mt-2 text-text-secondary">
              Real environmental action happening across the platform
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card><p className="text-3xl font-bold text-primary">{IMPACT_STATS.reportsFiled.toLocaleString()}</p><p className="mt-1 text-sm text-text-secondary">Reports Filed</p></Card>
              <Card><p className="text-3xl font-bold text-primary">{IMPACT_STATS.issuesResolved.toLocaleString()}</p><p className="mt-1 text-sm text-text-secondary">Issues Resolved</p></Card>
              <Card><p className="text-3xl font-bold text-primary">{IMPACT_STATS.activeVolunteers}</p><p className="mt-1 text-sm text-text-secondary">Active Volunteers</p></Card>
              <Card><p className="text-3xl font-bold text-primary">{IMPACT_STATS.teamsActive}</p><p className="mt-1 text-sm text-text-secondary">Active Teams</p></Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 lg:px-8">
          <h2 className="text-2xl font-semibold">How it works</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { step: "1", title: "Report", desc: "Document environmental issues with photos and location." },
              { step: "2", title: "Connect", desc: "Smart routing assigns reports to the best nearby teams." },
              { step: "3", title: "Resolve", desc: "Upload before/after proof and earn badges for your impact." },
            ].map(({ step, title, desc }) => (
              <Card key={step} padding="lg">
                <span className="text-sm font-medium text-primary">Step {step}</span>
                <h3 className="mt-2 text-lg font-medium">{title}</h3>
                <p className="mt-2 text-sm text-text-secondary">{desc}</p>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-text-secondary">
        GreenConnect — Built for community environmental action
      </footer>
    </div>
  );
}
