import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, SectionHeading, ButtonLink, Eyebrow } from "@/components/ui";
import { Logo } from "@/components/logo";
import { formatEGP } from "@/lib/format";

export default async function HomePage() {
  const [counselors, products] = await Promise.all([
    prisma.counselor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { variants: true },
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-50">
        <Image
          src="/brand/logo-icon-teal.png"
          alt=""
          width={783}
          height={765}
          className="pointer-events-none absolute -right-24 -top-16 h-[28rem] w-[28rem] opacity-[0.06] sm:h-[36rem] sm:w-[36rem]"
        />
        <Container className="relative py-20 sm:py-28">
          <Eyebrow>Psychologist-led · Est. 2021</Eyebrow>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold leading-tight text-brand-900 sm:text-5xl">
            A self-exploration journey, with you every step of the way.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink/70">
            Let It Out is a mental health service enhancing wellbeing through
            evidence-based research, practical tools, and compassionate
            care — through one-on-one counseling, guided journals, and
            workshops for workplaces and communities.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/counseling" variant="primary">
              Book a session
            </ButtonLink>
            <ButtonLink href="/shop" variant="outline">
              Explore guided journals
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Our services"
            title="Support that meets you where you are"
            description="Three ways to work with us — whichever fits your life right now."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            <ServiceCard
              href="/counseling"
              title="Individual Online Counseling"
              description="One-on-one sessions with specialized psychotherapists using CBT, ACT, and DBT frameworks, personalized to you."
            />
            <ServiceCard
              href="/workshops"
              title="Corporate Wellbeing Workshops"
              description="Interactive, evidence-based sessions designed to enhance employee wellbeing — from stress management to mental health first-aid."
            />
            <ServiceCard
              href="/shop"
              title="Guided Journals & Digital Resources"
              description="Practical, CBT-informed self-help journals to help you build a healthier relationship with yourself, in print or ebook."
            />
          </div>
        </Container>
      </section>

      {/* Story teaser */}
      <section className="bg-brand-700 py-20 text-white sm:py-24">
        <Container className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <Eyebrow>Our story</Eyebrow>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Founded to make quality mental health care feel reachable.
            </h2>
            <p className="mt-5 text-brand-50/90">
              Founded by psychologist and trainer Karla Meleka, Let It Out
              delivers professional mental health support tailored to your
              community&apos;s needs — reducing stigma, one step at a time.
            </p>
            <ButtonLink href="/about" variant="accent" className="mt-6">
              Read our story
            </ButtonLink>
          </div>
          <div className="flex justify-center">
            <Logo variant="icon-white" height={220} />
          </div>
        </Container>
      </section>

      {/* Counselors */}
      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Meet the team"
            title="Psychologist-led, evidence-based care"
            description="Every session is led by a licensed, specialized psychotherapist."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {counselors.map((c) => (
              <Link
                key={c.id}
                href={`/counseling/${c.slug}`}
                className="group rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 font-display text-lg font-bold text-brand-700">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-brand-800">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm text-ink/60">{c.credentials}</p>
                <p className="mt-3 text-sm font-medium text-brand-600 group-hover:underline">
                  View profile &rarr;
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Shop teaser */}
      <section className="bg-sand-100 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Guided journals"
            title="Self-help tools you can hold onto"
            description="CBT-informed guided journals, available as physical books or ebooks."
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {products.map((p) => {
              const cheapest = Math.min(...p.variants.map((v) => v.priceEGP));
              return (
                <Link
                  key={p.id}
                  href={`/shop/${p.slug}`}
                  className="group flex items-center gap-6 rounded-2xl border border-brand-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-brand-600 font-display text-2xl font-bold text-white">
                    {p.durationDays}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-brand-800">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink/60">
                      From {formatEGP(cheapest)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-brand-600 group-hover:underline">
                      Shop now &rarr;
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Journal app CTA */}
      <section className="py-20 sm:py-24">
        <Container className="rounded-3xl bg-brand-50 px-6 py-14 text-center sm:px-16">
          <SectionHeading
            align="center"
            eyebrow="In your pocket"
            title="Daily journaling prompts, whenever you need them"
            description="Create a free account for guided, self-exploration prompts and a private space to write — right on the app."
          />
          <div className="mt-8 flex justify-center gap-4">
            <ButtonLink href="/signup" variant="primary">
              Start journaling free
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

function ServiceCard({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-brand-100 bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
    >
      <h3 className="font-display text-lg font-semibold text-brand-800">{title}</h3>
      <p className="mt-3 flex-1 text-sm text-ink/70">{description}</p>
      <p className="mt-4 text-sm font-medium text-brand-600 group-hover:underline">
        Learn more &rarr;
      </p>
    </Link>
  );
}
