import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { Container, SectionHeading, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { Ribbon, WaveDivider, DoodleField, Swash } from "@/components/decor";
import { ProductCover, PRODUCT_PHOTOS } from "@/components/product-cover";
import { formatEGP } from "@/lib/format";

export default async function HomePage() {
  const [counselors, products] = await Promise.all([
    prisma.counselor.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
      include: { variants: { where: { format: "PHYSICAL" } } },
    }),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-50">
        <DoodleField />
        <Container className="relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Ribbon>Psychologist-led · Est. 2021</Ribbon>
            <h1 className="mt-5 max-w-xl font-display text-4xl font-semibold leading-[1.1] text-brand-900 sm:text-5xl">
              A <span className="mark-swash italic text-brand-700">self-exploration<Swash /></span>{" "}
              journey, with you every step of the way.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-ink/70">
              Let It Out enhances wellbeing through evidence-based research,
              practical tools, and compassionate care — through one-on-one
              counseling, guided journals, and workshops for workplaces and
              communities.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <ButtonLink href="/counseling" variant="primary">
                Book a session
              </ButtonLink>
              <ButtonLink href="/shop" variant="outline">
                Explore guided journals
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-sm lg:block">
            <div className="absolute -left-6 top-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-lg">
              <p className="font-display text-sm italic text-brand-800">
                &ldquo;What is one thing your body did for you today that you
                didn&apos;t thank it for?&rdquo;
              </p>
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-brand-500">
                Today&apos;s prompt
              </p>
            </div>
            <div className="ml-16 mt-24 rounded-2xl bg-brand-700 p-6 text-white shadow-xl">
              <Logo variant="icon-white" height={64} />
              <p className="mt-4 font-display text-lg italic">
                Let it out. One page at a time.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <WaveDivider fill="fill-white" />

      {/* Services */}
      <section className="pb-24 pt-4 sm:pb-28">
        <Container>
          <SectionHeading
            eyebrow="Our services"
            title="Support that meets you where you are"
            description="Three ways to work with us — whichever fits your life right now."
          />
          <div className="mt-14 grid gap-x-6 gap-y-10 sm:grid-cols-3">
            <ServiceCard
              index="01"
              href="/counseling"
              title="Individual Online Counseling"
              description="One-on-one sessions with specialized psychotherapists using CBT, ACT, and DBT frameworks, personalized to you."
            />
            <ServiceCard
              index="02"
              href="/workshops"
              title="Trainings and Workshops"
              description="Interactive, evidence-based sessions designed to enhance employee wellbeing — from stress-management to mental health first-aid."
              offset
            />
            <ServiceCard
              index="03"
              href="/shop"
              title="Guided Journals & Digital Resources"
              description="Practical, CBT-informed self-help journals to help you build a healthier relationship with yourself."
            />
          </div>
        </Container>
      </section>

      {/* Story teaser */}
      <section className="relative overflow-hidden bg-brand-800 py-24 text-white">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-800" />
        <Image
          src="/brand/logo-icon-white.png"
          alt=""
          width={852}
          height={829}
          className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 opacity-[0.06]"
        />
        <Container className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <Ribbon tone="dark">Our story</Ribbon>
            <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
              Founded to make quality mental health care reachable.
            </h2>
            <p className="mt-5 text-brand-50/85">
              Founded by Egyptian psychologist Karla Meleka, Let It Out
              delivers professional mental health support tailored to your
              community&apos;s needs, reducing stigma, one mind at a time.
            </p>
            <ButtonLink href="/about" variant="bright" className="mt-7">
              Read our story
            </ButtonLink>
          </div>
          <div className="flex justify-center">
            <Logo variant="icon-white" height={200} className="drop-shadow-xl" />
          </div>
        </Container>
      </section>

      {/* Counselors */}
      <section className="py-24">
        <Container>
          <SectionHeading
            eyebrow="Meet the team"
            title="Psychologist-led, evidence-based care"
            description="Every session is led by a licensed, specialized psychotherapist."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {counselors.map((c) => (
              <Link
                key={c.id}
                href={`/counseling/${c.slug}`}
                className="group rounded-2xl border-2 border-brand-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-brand-200 bg-brand-50 font-display text-lg font-semibold text-brand-700">
                  {c.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-brand-900">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm text-ink/60">{c.credentials}</p>
                <p className="mt-3 text-sm font-medium text-brand-600 link-grow w-fit">
                  View profile &rarr;
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Shop teaser */}
      <section className="relative overflow-hidden bg-brand-50 py-24">
        <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-50" />
        <Container>
          <SectionHeading
            eyebrow="Guided journals"
            title="Self-help tools you can hold onto"
            description="CBT-informed guided journals, paid on delivery."
          />
          <div className="mt-14 grid gap-10 sm:grid-cols-2">
            {products.map((p) => {
              const price = Math.min(...p.variants.map((v) => v.priceEGP));
              return (
                <Link key={p.id} href={`/shop/${p.slug}`} className="group flex items-center gap-6">
                  <div className="relative w-32 shrink-0 overflow-hidden rounded-xl shadow-md transition-transform group-hover:-translate-y-1">
                    {PRODUCT_PHOTOS[p.slug] ? (
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={PRODUCT_PHOTOS[p.slug]}
                          alt={`${p.title} guided journal`}
                          fill
                          sizes="128px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <ProductCover slug={p.slug} title="" durationDays={p.durationDays} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-brand-900">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm text-ink/60">
                      {formatEGP(price)}
                    </p>
                    <p className="mt-2 text-sm font-medium text-brand-600 link-grow w-fit">
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
      <section className="py-24">
        <Container className="relative overflow-hidden rounded-3xl border-2 border-brand-100 bg-white px-6 py-16 text-center sm:px-16">
          <DoodleField />
          <div className="relative">
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
          </div>
        </Container>
      </section>
    </>
  );
}

function ServiceCard({
  index,
  href,
  title,
  description,
  offset,
}: {
  index: string;
  href: string;
  title: string;
  description: string;
  offset?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group relative flex flex-col rounded-2xl border-2 border-brand-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-lg ${offset ? "sm:mt-8" : ""}`}
    >
      <span className="font-display text-4xl font-semibold text-brand-100 transition-colors group-hover:text-brand-200">
        {index}
      </span>
      <h3 className="mt-2 font-display text-lg font-semibold text-brand-900">{title}</h3>
      <p className="mt-3 flex-1 text-sm text-ink/70">{description}</p>
      <p className="mt-4 text-sm font-medium text-brand-600 link-grow w-fit">
        Learn more &rarr;
      </p>
    </Link>
  );
}
