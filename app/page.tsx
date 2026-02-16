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
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center px-4 md:px-6 mx-auto">
          <Link className="flex items-center gap-2 font-bold text-xl" href="/">
            <Building2 className="h-6 w-6 text-primary" />
            <span>SmartCity</span>
          </Link>
          <nav className="hidden md:flex ml-auto gap-6">
            <Link
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#features"
            >
              Features
            </Link>
            <Link
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#services"
            >
              Services
            </Link>
            <Link
              className="text-sm font-medium hover:text-primary transition-colors"
              href="#dashboard"
            >
              Dashboard
            </Link>
          </nav>
          <div className="ml-auto md:ml-4 flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Smarter Cities for a Better Future
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Optimize urban living with our integrated smart city
                  management platform. Monitor, analyze, and improve city
                  services in real-time.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" className="h-11 px-8">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/#features">
                  <Button variant="outline" size="lg" className="h-11 px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted/50 flex justify-center"
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Comprehensive City Management
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mx-auto">
                  Our platform provides tools to manage every aspect of city
                  infrastructure from a single dashboard.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Activity className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Real-time Monitoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Monitor city metrics including traffic flow, air quality,
                    and energy consumption in real-time.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Truck className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Fleet Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Optimize public transport and waste management routes to
                    reduce costs and improve service.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <ShieldCheck className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Public Safety</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Integrated emergency response systems and surveillance
                    monitoring for safer neighborhoods.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Lightbulb className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Smart Lighting</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Automated street lighting systems that adjust based on
                    ambient light and presence detection.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Citizen Engagement</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Direct communication channels for citizens to report issues
                    and receive updates from the city.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart2 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Data Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Advanced analytics and reporting tools to make data-driven
                    decisions for urban planning.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 sm:px-10 md:gap-16 md:grid-cols-2">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
                  Case Studies
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Trusted by Leading Smart Cities
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See how cities around the world are using our platform to
                  improve quality of life for their citizens.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/case-studies">
                    <Button variant="outline">View Case Studies</Button>
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Metro City
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reduced energy consumption by 25%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Harbor Town
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Improved waste collection efficiency by 40%
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Tech Valley
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Decreased traffic congestion by 30%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground flex justify-center">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Ready to Transform Your City?
                </h2>
                <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed opacity-90 mx-auto">
                  Join the network of smart cities today. Get started with our
                  platform and see the difference.
                </p>
              </div>
              <div className="space-x-4">
                <Link href="/register">
                  <Button size="lg" variant="secondary" className="h-11 px-8">
                    Get Started Now
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-11 px-8 bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full py-6 bg-background border-t">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 mx-auto">
          <div className="flex items-center gap-2 font-semibold">
            <Building2 className="h-5 w-5" />
            <span>SmartCity</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 SmartCity Management. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
              href="#"
            >
              Terms
            </Link>
            <Link
              className="text-sm text-muted-foreground hover:underline underline-offset-4"
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
