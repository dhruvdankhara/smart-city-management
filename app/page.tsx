import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowRight,
  BarChart2,
  Building2,
  Lightbulb,
  ShieldCheck,
  Truck,
  Users,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background relative selection:bg-primary/20">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]" />
        <div className="absolute right-0 bottom-0 -z-10 h-[310px] w-[310px] rounded-full bg-secondary/20 opacity-20 blur-[100px]" />
      </div>

      <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-6xl px-4 md:px-6">
        <div className="flex h-16 items-center rounded-2xl border border-white/20 bg-white/10 px-4 md:px-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl supports-[backdrop-filter]:bg-white/10 dark:bg-black/10 dark:border-white/10 transition-all hover:bg-white/20 dark:hover:bg-black/20">
          <Link
            className="flex items-center gap-2 font-bold text-xl hover:opacity-90 transition-opacity"
            href="/"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              SmartCity
            </span>
          </Link>
          <nav className="hidden md:flex ml-auto gap-8">
            <Link
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
              href="#services"
            >
              Services
            </Link>
            <Link
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1"
              href="#dashboard"
            >
              Dashboard
            </Link>
          </nav>
          <div className="ml-auto md:ml-6 flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-primary/10 hover:text-primary"
              >
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button
                size="sm"
                className="shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 pt-24">
        <section className="w-full py-20 md:py-32 flex justify-center relative overflow-hidden">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4 max-w-4xl mx-auto">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary backdrop-blur-md">
                  <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                  Now available in 50+ cities
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 pb-2">
                  Smarter Cities for a <br className="hidden md:block" />
                  <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Better Future
                  </span>
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl leading-relaxed">
                  Optimize urban living with our integrated smart city
                  management platform. Monitor, analyze, and improve city
                  services in real-time using next-gen AI technology.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 min-w-[200px]">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="h-12 px-8 text-base shadow-xl shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/#features">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-12 px-8 text-base backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all duration-300"
                  >
                    View Demo
                  </Button>
                </Link>
              </div>

              <div className="mt-12 w-full max-w-5xl mx-auto p-2 rounded-2xl bg-gradient-to-b from-white/20 to-transparent backdrop-blur-sm border border-white/20 shadow-2xl">
                <div className="rounded-xl overflow-hidden aspect-video bg-muted/50 border border-white/10 relative group">
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="sr-only">Dashboard Preview</span>
                  </div>
                  {/* Placeholder for dashboard image */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center text-muted-foreground">
                    <Activity className="h-16 w-16 opacity-20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-20 md:py-32 relative flex justify-center"
        >
          <div className="absolute inset-0 -z-10 bg-muted/30 clip-path-slant" />
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Comprehensive City Management
                </h2>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Our platform provides tools to manage every aspect of city
                  infrastructure from a single dashboard.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  icon: Activity,
                  title: "Real-time Monitoring",
                  desc: "Monitor city metrics including traffic flow, air quality, and energy consumption in real-time.",
                },
                {
                  icon: Truck,
                  title: "Fleet Management",
                  desc: "Optimize public transport and waste management routes to reduce costs and improve service.",
                },
                {
                  icon: ShieldCheck,
                  title: "Public Safety",
                  desc: "Integrated emergency response systems and surveillance monitoring for safer neighborhoods.",
                },
                {
                  icon: Lightbulb,
                  title: "Smart Lighting",
                  desc: "Automated street lighting systems that adjust based on ambient light and presence detection.",
                },
                {
                  icon: Users,
                  title: "Citizen Engagement",
                  desc: "Direct communication channels for citizens to report issues and receive updates from the city.",
                },
                {
                  icon: BarChart2,
                  title: "Data Analytics",
                  desc: "Advanced analytics and reporting tools to make data-driven decisions for urban planning.",
                },
              ].map((feature, i) => (
                <Card
                  key={i}
                  className="group relative overflow-hidden border-white/20 bg-white/40 dark:bg-black/40 backdrop-blur-xl transition-all hover:bg-white/60 dark:hover:bg-black/60 shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <CardHeader className="relative z-10">
                    <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <CardDescription className="text-base">
                      {feature.desc}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary">
                  Case Studies
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Trusted by Leading Smart Cities
                </h2>
                <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See how cities around the world are using our platform to
                  improve quality of life for their citizens.
                </p>
                <div className="flex flex-col gap-4">
                  {[
                    "Reduced energy consumption by 25% in Metro City",
                    "Improved waste collection efficiency by 40% in Harbor Town",
                    "Decreased traffic congestion by 30% in Tech Valley",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      <span className="text-lg">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Link href="/case-studies">
                    <Button
                      variant="outline"
                      className="h-11 px-6 rounded-full"
                    >
                      View All Case Studies
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary to-purple-600 opacity-20 blur-xl" />
                <div className="relative grid gap-6 rounded-xl border border-white/20 bg-white/10 p-8 py-10 shadow-2xl backdrop-blur-xl">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 rounded-lg bg-white/50 p-4 dark:bg-black/50 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                        M
                      </div>
                      <div>
                        <p className="font-semibold">Metro City</p>
                        <p className="text-sm text-muted-foreground">
                          Energy Management
                        </p>
                      </div>
                      <div className="ml-auto font-bold text-green-600">
                        +25%
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg bg-white/50 p-4 dark:bg-black/50 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg">
                        H
                      </div>
                      <div>
                        <p className="font-semibold">Harbor Town</p>
                        <p className="text-sm text-muted-foreground">
                          Waste Efficiency
                        </p>
                      </div>
                      <div className="ml-auto font-bold text-green-600">
                        +40%
                      </div>
                    </div>
                    <div className="flex items-center gap-4 rounded-lg bg-white/50 p-4 dark:bg-black/50 shadow-sm transition-transform hover:scale-[1.02]">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        T
                      </div>
                      <div>
                        <p className="font-semibold">Tech Valley</p>
                        <p className="text-sm text-muted-foreground">
                          Traffic Flow
                        </p>
                      </div>
                      <div className="ml-auto font-bold text-green-600">
                        +30%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-20 md:py-32 relative overflow-hidden flex justify-center">
          <div className="absolute inset-0 -z-10 bg-primary/90">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
          </div>
          <div className="container px-4 md:px-6 relative z-10 text-primary-foreground">
            <div className="flex flex-col items-center justify-center space-y-8 text-center">
              <div className="space-y-4 max-w-3xl">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Ready to Transform Your City?
                </h2>
                <p className="text-xl md:text-2xl opacity-90 mx-auto">
                  Join the network of smart cities today. Get started with our
                  platform and see the difference.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link href="/register">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 px-8 w-full sm:w-auto text-lg font-semibold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
                  >
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 w-full sm:w-auto text-lg bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground hover:border-primary-foreground"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-8 bg-background border-t mt-auto">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-6 mx-auto">
          <div className="flex items-center gap-2 font-semibold">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-lg">SmartCity</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © 2024 SmartCity Management. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
              href="#"
            >
              Terms
            </Link>
            <Link
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors hover:underline underline-offset-4"
              href="#"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
