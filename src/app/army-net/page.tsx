import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeftIcon } from "lucide-react"

import { GuideContent } from "@/components/army-net/guide-content"
import { GuideToc } from "@/components/army-net/guide-toc"
import { SiteHeader } from "@/components/layout/site-header"
import { MeshGradient } from "@/components/ui/mesh-gradient"
import { ARMY_NET_FACTS } from "@/lib/army-net"

export const metadata: Metadata = {
  title: "Army Net — Network and Active Directory lab",
  description:
    "Step-by-step lab reference for switch, router, DNS, DHCP, and Active Directory configuration on the ArmyNet.mil domain.",
}

export default function ArmyNetPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[var(--canvas-soft)]">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-card px-6 py-14 md:py-20">
          <MeshGradient />
          <div className="relative mx-auto w-full max-w-[1200px]">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 font-mono text-xs text-[var(--mute)] transition-colors hover:text-foreground"
            >
              <ArrowLeftIcon className="size-3.5" />
              All study sets
            </Link>
            <h1 className="mt-4 text-5xl font-semibold tracking-[-2.4px] text-foreground">
              Army Net.
            </h1>
            <p className="mt-4 max-w-2xl text-lg leading-7 text-muted-foreground">
              Network and Active Directory lab study guide — switch, router,
              DNS, DHCP, and user account build in one place.
            </p>
            <dl className="mt-8 flex flex-wrap gap-2">
              {ARMY_NET_FACTS.map((fact) => (
                <div
                  key={fact.label}
                  className="flex items-baseline gap-2 rounded-lg border border-border bg-background/70 px-3 py-1.5 backdrop-blur-sm"
                >
                  <dt className="font-mono text-[11px] tracking-[0.02em] text-[var(--mute)] uppercase">
                    {fact.label}
                  </dt>
                  <dd className="font-mono text-[13px] text-foreground">
                    {fact.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="px-6 py-10 md:py-14">
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
            <aside className="min-w-0">
              <GuideToc />
            </aside>
            <GuideContent />
          </div>
        </section>
      </main>
    </div>
  )
}
