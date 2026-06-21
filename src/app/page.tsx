import Link from "next/link";
import { 
  Leaf, 
  ArrowRight, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Award, 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  BarChart3,
  MessageSquare,
  Camera,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { IMPACT_STATS } from "@/lib/mock-data";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#070809] [.light_&]:bg-[#EAF3C4] text-text-primary selection:bg-primary/30 selection:text-white">
      
      {/* Subtle top horizontal separator */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 [.light_&]:via-black/5 to-transparent" />

      {/* Vercel-Style Sticky Glass Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#070809]/80 [.light_&]:bg-[#F7FBEA]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-black">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="text-base font-bold tracking-tight text-text-primary">GreenConnect</span>
          </div>
          
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero Section (Reduced Height, Realistic Map/Product Preview Above the Fold) */}
        <section className="pt-12 pb-16 md:pt-16 md:pb-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-5 text-left space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] [.light_&]:bg-[#F0F7D6] border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] px-3.5 py-1 text-xs text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                Community environmental hub
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl leading-[1.1] text-text-primary">
                Turn Environmental Problems Into Community Action
              </h1>
              
              <p className="text-base text-text-secondary leading-relaxed">
                Report local environmental issues, join nearby cleanup teams, and track real-world impact together.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="md" className="font-semibold">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="secondary" size="md">
                    Log In
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Product/Map Preview Widget - Google Maps + Airbnb + Stripe Hybrid */}
            <div className="lg:col-span-7">
              <div className="rounded-xl border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#0c0e10] [.light_&]:bg-[#F7FBEA] p-1.5 shadow-2xl dark:shadow-black/60 overflow-hidden">
                <div className="rounded-lg bg-[#0e1113] [.light_&]:bg-[#F0F7D6] overflow-hidden">
                  
                  {/* Mock Window Header */}
                  <div className="flex items-center justify-between border-b border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#0b0c0e] [.light_&]:bg-[#F7FBEA] px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-white/10 [.light_&]:bg-black/10" />
                      <span className="h-3 w-3 rounded-full bg-white/10 [.light_&]:bg-black/10" />
                      <span className="h-3 w-3 rounded-full bg-white/10 [.light_&]:bg-black/10" />
                      <span className="ml-3 text-xs text-text-secondary font-mono">greenconnect.org/map</span>
                    </div>
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      12 Active Missions
                    </span>
                  </div>

                  <div className="grid grid-cols-12 h-[340px]">
                    {/* Mock Sidebar List (Airbnb Communities style) */}
                    <div className="col-span-4 border-r border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#0c0e10] [.light_&]:bg-[#F0F7D6] p-3 flex flex-col justify-between hidden sm:flex">
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute top-2.5 left-2.5 h-3.5 w-3.5 text-text-secondary/50" />
                          <input 
                            type="text" 
                            disabled 
                            placeholder="Search active issues..." 
                            className="w-full rounded-md border border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#141619] [.light_&]:bg-[#F7FBEA] pl-8 pr-2 py-1.5 text-[11px] text-text-primary outline-none"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50 px-1">Nearby Alerts</p>
                          
                          <div className="rounded-md bg-white/[0.02] [.light_&]:bg-[#F7FBEA] border border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] p-2 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-text-primary">Plastic Waste pile</span>
                              <span className="h-2 w-2 rounded-full bg-warning" />
                            </div>
                            <p className="text-[10px] text-text-secondary">Central Park Trail · 2.4 km</p>
                          </div>

                          <div className="rounded-md bg-white/[0.01] [.light_&]:bg-transparent p-2 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-semibold text-text-secondary">Storm Drain residue</span>
                              <span className="h-2 w-2 rounded-full bg-danger" />
                            </div>
                            <p className="text-[10px] text-text-secondary/60">Main St. Culvert · 4.1 km</p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] pt-3">
                        <div className="flex items-center gap-2 rounded-md bg-primary/5 border border-primary/10 p-2">
                          <Users className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-text-primary">River Guardians</p>
                            <p className="text-[9px] text-text-secondary">Active cleanup nearby</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Mock Map Canvas (Google Maps gridline style with pins) */}
                    <div className="col-span-12 sm:col-span-8 relative bg-[#0e1113] [.light_&]:bg-[#F0F7D6] bg-[radial-gradient(#ffffff03_1px,transparent_1px)] [.light_&]:bg-[radial-gradient(rgba(16,185,129,0.15)_1px,transparent_1px)] bg-[size:16px_16px] overflow-hidden flex items-center justify-center">
                      
                      {/* Map grid lines */}
                      <svg className="absolute inset-0 w-full h-full text-white/[0.02] [.light_&]:text-black/[0.04]" xmlns="http://www.w3.org/2000/svg">
                        <line x1="0" y1="100" x2="100%" y2="100" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="0" y1="220" x2="100%" y2="220" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="120" y1="0" x2="120" y2="100%" stroke="currentColor" strokeWidth="0.5" />
                        <line x1="280" y1="0" x2="280" y2="100%" stroke="currentColor" strokeWidth="0.5" />
                      </svg>

                      {/* Map Pins */}
                      <div className="absolute top-[25%] left-[30%] group cursor-pointer flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#10b981]/10 border border-primary text-primary shadow-sm">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div className="absolute top-8 bg-[#141619] [.light_&]:bg-[#F7FBEA] border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] px-2 py-1 rounded text-[9px] font-bold text-text-primary whitespace-nowrap">
                          Resolved · Lake Trail
                        </div>
                      </div>

                      <div className="absolute top-[55%] left-[65%] flex flex-col items-center">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-warning/10 border border-warning text-warning shadow-sm">
                          <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div className="absolute top-8 bg-[#141619] [.light_&]:bg-[#F7FBEA] border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] px-2.5 py-1 rounded text-[9px] text-text-primary whitespace-nowrap shadow-sm">
                          <span className="font-bold text-warning">Park Cleanup</span> · 4 joining
                        </div>
                      </div>

                      {/* Map UI controls mockup */}
                      <div className="absolute right-3 bottom-3 flex flex-col gap-1">
                        <button className="h-6 w-6 rounded bg-[#1c1f22] [.light_&]:bg-[#F7FBEA] border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] text-xs font-bold text-text-primary flex items-center justify-center hover:bg-[#252a2d] [.light_&]:hover:bg-[#F0F7D6] transition-colors">+</button>
                        <button className="h-6 w-6 rounded bg-[#1c1f22] [.light_&]:bg-[#F7FBEA] border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] text-xs font-bold text-text-primary flex items-center justify-center hover:bg-[#252a2d] [.light_&]:hover:bg-[#F0F7D6] transition-colors">-</button>
                      </div>

                      <div className="absolute left-3 top-3 bg-[#1c1f22]/90 [.light_&]:bg-[#F7FBEA]/90 border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] rounded px-2 py-1 text-[10px] text-text-secondary flex items-center gap-1.5 backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-primary" />
                        Live Feed Active
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Social Proof: Impact Statistics (Stripe Metric Cards Style) */}
        <section className="py-12 border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)]">
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Reports Logged", val: IMPACT_STATS.reportsFiled.toLocaleString(), desc: "Verified local issues" },
              { label: "Active Volunteers", val: IMPACT_STATS.activeVolunteers.toString(), desc: "Local community helpers" },
              { label: "CO₂ Reduced Estimate", val: "4,850 kg", desc: "Organic debris diverted" },
              { label: "Participating Cities", val: "124", desc: "Active neighborhoods" },
            ].map(({ label, val, desc }) => (
              <Card key={label} className="p-5 bg-white/[0.01] [.light_&]:bg-[#F7FBEA] hover:bg-white/[0.02] [.light_&]:hover:bg-[#FAFDF2] border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] hover:border-white/10 [.light_&]:hover:border-[rgba(120,140,80,0.24)] transition-all rounded-xl" hoverable={true}>
                <p className="text-xs font-medium text-text-secondary">{label}</p>
                <p className="mt-3 text-3xl font-extrabold text-text-primary tracking-tight">{val}</p>
                <p className="mt-1 text-[11px] text-text-secondary/70">{desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Features Section (Linear Card Design) */}
        <section className="py-16 border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] space-y-12">
          <div className="max-w-2xl text-left space-y-3">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Built for Grassroots Action</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              We provide communities with the coordination and data layers required to restore local environments effectively.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                title: "Report Issues", 
                desc: "Pinpoint environmental hazards, dump sites, or spills. Upload photo evidence and coordinate markers.", 
                icon: MapPin, 
                accent: "text-warning bg-warning/5 border-warning/10" 
              },
              { 
                title: "Discover Teams", 
                desc: "Find and join cleanup initiatives organized by nearby neighborhood leaders, civic groups, and NGOs.", 
                icon: Users, 
                accent: "text-blue-600 dark:text-blue-400 bg-blue-500/5 border-blue-500/10" 
              },
              { 
                title: "Track Real Impact", 
                desc: "Validate tasks with before-and-after proof. Earn verified community audit history for cleanups.", 
                icon: CheckCircle2, 
                accent: "text-primary bg-primary/5 border-primary/10" 
              },
              { 
                title: "Earn Credentials", 
                desc: "Build your civic score. Earn eco badges representing audited volunteer contributions.", 
                icon: Award, 
                accent: "text-amber-600 dark:text-amber-400 bg-amber-500/5 border-amber-500/10" 
              },
            ].map(({ title, desc, icon: Icon, accent }) => (
              <Card key={title} className="p-6 bg-white/[0.01] [.light_&]:bg-[#F7FBEA] border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] hover:border-white/10 [.light_&]:hover:border-[rgba(120,140,80,0.24)] flex flex-col justify-between h-full rounded-xl">
                <div className="space-y-4">
                  <div className={`inline-flex rounded-lg p-2.5 border ${accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary">{title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Live Map Preview Section (Realistic Map Interface Mockup) */}
        <section className="py-16 border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] grid gap-8 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5 text-left space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Real-Time Reporting Grid</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Our interactive map routes alerts directly to the nearest cleanup team. Search, filter by severity, and coordinate equipment drops right where they are needed most.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">✓</div>
                <span>Filter alerts by category and severity matrix</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">✓</div>
                <span>Coordinate logistics drops and staging zones</span>
              </div>
            </div>
          </div>

          {/* Realistic Map Interface Grid Mockup */}
          <div className="lg:col-span-7 rounded-xl border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#0c0e10] [.light_&]:bg-[#F7FBEA] p-1.5 shadow-xl">
            <div className="rounded-lg bg-[#0e1113] [.light_&]:bg-[#F0F7D6] overflow-hidden border border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)]">
              
              {/* Mock Dashboard Top Control Bar */}
              <div className="flex items-center justify-between bg-[#121518] [.light_&]:bg-[#F7FBEA] px-4 py-3 border-b border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/70">Severity Index:</span>
                  <div className="flex gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-danger/10 border border-danger/25 text-[9px] font-bold text-danger">High (Severity 4+)</span>
                    <span className="px-1.5 py-0.5 rounded bg-warning/10 border border-warning/25 text-[9px] font-bold text-warning">Medium</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded bg-[#1c2024] [.light_&]:bg-[#F0F7D6] border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] text-[9px] font-bold text-text-primary flex items-center gap-1 hover:bg-[#252a2d] [.light_&]:hover:bg-[#F7FBEA] transition-colors">
                    <Filter className="h-3 w-3" /> Filter Categories
                  </button>
                </div>
              </div>

              {/* Map Mockup Grid */}
              <div className="relative h-[260px] bg-[#0c0e10] [.light_&]:bg-[#F0F7D6] bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] [.light_&]:bg-[linear-gradient(to_right,rgba(16,185,129,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(16,185,129,0.06)_1px,transparent_1px)] bg-[size:24px_24px] flex items-center justify-center">
                
                {/* Active Tooltip Popover */}
                <div className="absolute top-[20%] left-[25%] bg-[#15191c] [.light_&]:bg-[#F7FBEA] border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] rounded-lg p-3 max-w-[240px] shadow-2xl z-20 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-warning">Active Cleanup Event</span>
                    <span className="text-[9px] text-text-secondary flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> 2h left</span>
                  </div>
                  <p className="text-[11px] font-semibold text-text-primary">Riverbank Debris Extraction</p>
                  <div className="flex items-center justify-between text-[10px] text-text-secondary pt-1 border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)]">
                    <span>Organized by: <strong className="text-text-primary">River Guardians</strong></span>
                    <span className="text-primary font-bold">14 Joined</span>
                  </div>
                </div>

                {/* Other Pin Elements */}
                <div className="absolute bottom-[20%] right-[30%] flex items-center gap-1.5 bg-[#121517] [.light_&]:bg-[#F7FBEA] border border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] rounded-full px-2.5 py-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <span className="text-[10px] font-semibold text-text-primary">Staging Area Delta</span>
                </div>

                <div className="absolute top-[60%] right-[15%]">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-danger/10 border border-danger text-danger">
                    <MapPin className="h-3 w-3" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Impact Dashboard Preview (Analytics, Charts, Activity) */}
        <section className="py-16 border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] grid gap-8 lg:grid-cols-12 lg:items-center">
          
          {/* Left Side: Mockups */}
          <div className="lg:col-span-7 order-last lg:order-first grid gap-4 sm:grid-cols-2">
            
            {/* Chart Widget Mockup (Stripe/Vercel Line Graph) */}
            <div className="rounded-xl border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#0c0e10] [.light_&]:bg-[#F7FBEA] p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] pb-3">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50">Platform Performance</p>
                  <h4 className="text-lg font-bold text-text-primary">Issue Resolution Rate</h4>
                </div>
                <BarChart3 className="h-4 w-4 text-primary" />
              </div>

              {/* Clean SVG Line Chart */}
              <div className="h-[120px] w-full flex items-end">
                <svg className="w-full h-full text-primary" viewBox="0 0 200 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="currentColor" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="200" y2="20" stroke="currentColor" className="text-white/[0.03] [.light_&]:stroke-[rgba(120,140,80,0.1)]" strokeWidth="0.5" />
                  <line x1="0" y1="50" x2="200" y2="50" stroke="currentColor" className="text-white/[0.03] [.light_&]:stroke-[rgba(120,140,80,0.1)]" strokeWidth="0.5" />
                  <line x1="0" y1="80" x2="200" y2="80" stroke="currentColor" className="text-white/[0.03] [.light_&]:stroke-[rgba(120,140,80,0.1)]" strokeWidth="0.5" />
                  
                  {/* Gradient Area under curve */}
                  <path d="M 0,90 Q 40,65 80,45 T 160,25 T 200,15 L 200,100 L 0,100 Z" fill="url(#chartGrad)" />
                  
                  {/* Curve Path */}
                  <path d="M 0,90 Q 40,65 80,45 T 160,25 T 200,15" fill="none" stroke="currentColor" strokeWidth="2.5" />
                  
                  {/* Indicator Dot */}
                  <circle cx="200" cy="15" r="4" fill="currentColor" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[10px] text-text-secondary font-mono pt-1">
                <span>Month 1</span>
                <span>Month 3</span>
                <span className="text-primary font-bold">Current: 87.2%</span>
              </div>
            </div>

            {/* Recent Activity Live Stream */}
            <div className="rounded-xl border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#0c0e10] [.light_&]:bg-[#F7FBEA] p-5 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-secondary/50 border-b border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] pb-3">
                Live Audit Activity
              </p>
              
              <div className="space-y-3.5">
                {[
                  { user: "Aarav M.", action: "filed a report", target: "Waste Accumulation", time: "4m ago" },
                  { user: "Green Delhi", action: "resolved issue", target: "Main St. Overflow", time: "2h ago" },
                  { user: "Sarah J.", action: "verified recovery", target: "Lake Trail debris", time: "5h ago" }
                ].map(({ user, action, target, time }, i) => (
                  <div key={i} className="flex items-start justify-between text-[11px] gap-2">
                    <div className="space-y-0.5">
                      <span className="font-bold text-text-primary">{user}</span>
                      <span className="text-text-secondary"> {action} </span>
                      <span className="font-semibold text-primary">{target}</span>
                    </div>
                    <span className="text-[9px] text-text-secondary/60 font-mono whitespace-nowrap">{time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Copy */}
          <div className="lg:col-span-5 text-left space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-text-primary">Audited Impact Verification</h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Every cleanup project contains transparent before-and-after photographic evidence, timestamped logs, and verified participant rosters. Keep track of community hours and carbon diversion metrics in real time.
            </p>
            <Link href="/signup">
              <button className="group flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-all">
                Audit our community metrics <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </Link>
          </div>

        </section>

        {/* Audited Impact Verification Section */}
        <section className="py-16 border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] space-y-12">
          <div className="max-w-3xl text-left space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight text-text-primary">Audited Impact Verification</h2>
            <p className="text-sm text-text-secondary leading-relaxed max-w-2xl">
              Every environmental report on GreenConnect follows a transparent verification workflow designed to prevent false reporting and build community trust.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-12 lg:items-start">
            {/* Left Column: Verification Workflow Timeline */}
            <div className="lg:col-span-5 relative space-y-8 pl-6 border-l border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] ml-3">
              {[
                { 
                  title: "Issue Reported", 
                  desc: "Citizen uploads photos, location, and description.", 
                  icon: MapPin, 
                  accent: "text-warning bg-warning/5 border-warning/10" 
                },
                { 
                  title: "Community Review", 
                  desc: "Nearby volunteers and teams validate the issue.", 
                  icon: Users, 
                  accent: "text-blue-500 bg-blue-500/5 border-blue-500/10" 
                },
                { 
                  title: "Cleanup Evidence", 
                  desc: "Before-and-after photos are submitted after action.", 
                  icon: Camera, 
                  accent: "text-emerald-500 bg-emerald-500/5 border-emerald-500/10" 
                },
                { 
                  title: "Verified Impact", 
                  desc: "The report becomes a verified environmental contribution and updates community metrics.", 
                  icon: ShieldCheck, 
                  accent: "text-primary bg-primary/5 border-primary/10" 
                },
              ].map(({ title, desc, icon: Icon, accent }, idx) => (
                <div key={title} className="relative space-y-2">
                  {/* Timeline dot and connecting indicator */}
                  <div className="absolute -left-[39px] top-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#0c0e10] [.light_&]:bg-[#FAFDF2] border border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] text-xs font-bold text-text-secondary">
                    {idx + 1}
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className={`rounded-lg p-2 border ${accent} shrink-0`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-text-primary">{title}</h4>
                      <p className="text-xs text-text-secondary leading-relaxed mt-1">{desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Verification Dashboard Mockup */}
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-xl border border-white/10 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#0c0e10] [.light_&]:bg-[#F7FBEA] p-5 shadow-xl space-y-5">
                
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 gap-3.5">
                  {[
                    { label: "Verified Reports", value: "1,247", desc: "Passed multi-party check" },
                    { label: "Resolution Accuracy", value: "94%", desc: "Audited true successes" },
                    { label: "Before/After Proofs", value: "3,860", desc: "Photo & telemetry pairs" },
                    { label: "Active Auditors", value: "340", desc: "Vetted civic reviewers" }
                  ].map(({ label, value, desc }) => (
                    <div key={label} className="rounded-lg bg-[#141619]/40 [.light_&]:bg-[#F0F7D6]/60 border border-white/5 [.light_&]:border-[rgba(120,140,80,0.08)] p-3">
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{label}</p>
                      <p className="text-2xl font-extrabold text-text-primary tracking-tight mt-1">{value}</p>
                      <p className="text-[9px] text-text-secondary/80 mt-0.5">{desc}</p>
                    </div>
                  ))}
                </div>

                {/* Audit Card Preview (Interactive Audit Slip Mockup) */}
                <div className="rounded-lg border border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#0e1113] [.light_&]:bg-[#FAFDF2] p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 [.light_&]:border-[rgba(120,140,80,0.08)] pb-2.5">
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-text-secondary/70">Audit Report #089A</span>
                      <h5 className="text-xs font-bold text-text-primary mt-0.5">Plastic Waste Site</h5>
                    </div>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </span>
                  </div>

                  {/* Before/After Photo Mockups */}
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-text-secondary/70 uppercase">Before Cleanup</p>
                      <div className="rounded-md border border-white/5 [.light_&]:border-[rgba(120,140,80,0.08)] bg-[#141619] [.light_&]:bg-[#F0F7D6] h-20 flex flex-col items-center justify-center gap-1 text-danger/60">
                        <MapPin className="h-5 w-5" />
                        <span className="text-[9px] font-semibold">Debris Pinned</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-text-secondary/70 uppercase">After Cleanup</p>
                      <div className="rounded-md border border-[#10b981]/20 bg-[#10b981]/5 h-20 flex flex-col items-center justify-center gap-1 text-primary">
                        <Leaf className="h-5 w-5" />
                        <span className="text-[9px] font-semibold">Cleared & Restored</span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Slip Metadata */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-text-secondary pt-2 border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.08)]">
                    <div>
                      <span>Timestamp:</span>
                      <p className="font-semibold text-text-primary mt-0.5">Jun 21, 2026 16:15:30</p>
                    </div>
                    <div>
                      <span>Auditor Approval:</span>
                      <p className="font-semibold text-text-primary mt-0.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-primary" /> Verified by 14 Votes
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Vercel/Stripe-Style Multi-Column Footer */}
      <footer className="border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] bg-[#090a0b] [.light_&]:bg-[#F0F7D6] py-16 text-[11px] text-text-secondary mt-12">
        <div className="mx-auto max-w-6xl px-6 grid gap-8 grid-cols-2 md:grid-cols-5">
          
          {/* Logo Brand Info */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-black">
                <Leaf className="h-3.5 w-3.5" />
              </div>
              <span className="text-sm font-bold text-text-primary">GreenConnect</span>
            </div>
            <p className="max-w-xs text-text-secondary/70 leading-relaxed">
              A grassroots coordination platform connecting civic action groups to report, resolve, and audit environmental issues.
            </p>
          </div>

          {/* Links Grid Columns */}
          <div className="space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Product</h5>
            <ul className="space-y-2">
              <li><Link href="/map" className="hover:text-text-primary transition-colors">Interactive Map</Link></li>
              <li><Link href="/reports" className="hover:text-text-primary transition-colors">Active Reports</Link></li>
              <li><Link href="/teams" className="hover:text-text-primary transition-colors">Cleanup Teams</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Platform</h5>
            <ul className="space-y-2">
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Security & Auditing</span></li>
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Trust & Safety Guidelines</span></li>
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Civic Scoring API</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-text-primary uppercase tracking-wider text-[10px]">Resources</h5>
            <ul className="space-y-2">
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">NGO Handbook</span></li>
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Developer API Docs</span></li>
              <li><span className="hover:text-text-primary transition-colors cursor-pointer">Community Guidelines</span></li>
            </ul>
          </div>

        </div>

        {/* Footer separator line */}
        <div className="mx-auto max-w-6xl px-6 pt-8 mt-8 border-t border-white/5 [.light_&]:border-[rgba(120,140,80,0.12)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-text-secondary/60">
          <span>&copy; {new Date().getFullYear()} GreenConnect Civic Action Platform. Built for verified environmental audit trails.</span>
          <div className="flex gap-4">
            <span className="hover:text-text-primary cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-text-primary cursor-pointer transition-colors">Privacy Policy</span>
          </div>
        </div>
      </footer>

    </div>
  );
}


