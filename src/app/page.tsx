import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import {
  AmbientGlow,
  Badge,
  ButtonLink,
  Container,
  EmptyState,
  SectionHeading,
  Surface,
  surfaceClass,
  focusRing,
  liftPress,
  motionEase,
} from "@/components/ui";
import { Logo } from "@/components/logo";
import { Ribbon, WaveDivider, DoodleField, Swash } from "@/components/decor";
import { ProductCover, PRODUCT_PHOTOS } from "@/components/product-cover";
import { BagMark, CalendarMark } from "@/components/illustrations";
import {
  SkeletonGrid,
  SkeletonPersonCard,
  Skeleton,
} from "@/components/skeleton";
import { formatEGP } from "@/lib/format";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-brand-50/60 to-white">
        <AmbientGlow palette="brand" intensity={0.2} />
        <DoodleField />
        <Container className="relative grid gap-16 py-24 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Ribbon>Psychologist-led · Est. 2021</Ribbon>
            <h1 className="mt-6 max-w-xl font-display text-4xl font-semibold leading-[1.14] tracking-tight text-brand-900 sm:text-[3.4rem]">
              A <span className="mark-swash italic text-brand-700">self-exploration<Swash /></span>{" "}
              journey, with you every step of the way.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-ink-body">
              Let It Out enhances wellbeing through evidence-based research,
              practical tools, and compassionate care — through one-on-one
              counseling, guided journals, and workshops for workplaces and
              communities.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href="/counseling" variant="primary" size="lg">
                Book a session
              </ButtonLink>
              <ButtonLink href="/shop" variant="outline" size="lg">
                Explore guided journals
              </ButtonLink>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-sm lg:block">
            <Surface className="absolute -left-8 top-2 p-5">
              <p className="font-display text-sm italic leading-relaxed text-brand-800">
                &ldquo;What is one thing your body did for you today that you
                didn&apos;t thank it for?&rdquo;
              </p>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-500">
                Today&apos;s prompt
              </p>
            </Surface>
            <div className="relative ml-16 mt-28 overflow-hidden rounded-3xl border border-white/20 bg-linear-to-br from-brand-600 to-brand-800 p-7 text-white shadow-ambient-xl">
              <AmbientGlow palette="light" intensity={0.16} />
              <div className="relative">
                <Logo variant="icon-white" height={64} />
                <p className="mt-5 font-display text-lg italic leading-relaxed">
                  Let it out. One page at a time.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>


      {/* Services */}
      <section className="pb-28 pt-6 sm:pb-32">
        <Container>
          <SectionHeading
            eyebrow="Our services"
            title="Support that meets you where you are"
            description="Three ways to work with us — whichever fits your life right now."
          />
          <div className="mt-16 grid gap-x-7 gap-y-10 sm:grid-cols-3">
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
      <WaveDivider fill="fill-brand-700" className="-mb-px" />
      <section className="relative overflow-hidden bg-linear-to-br from-brand-700 via-brand-800 to-brand-900 py-28 text-white">
        <AmbientGlow palette="light" intensity={0.14} />
        <Image
          src="/brand/logo-icon-white.png"
          alt=""
          width={852}
          height={829}
          className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 opacity-[0.06]"
        />
        <Container className="relative grid items-center gap-12 md:grid-cols-2">
          <div>
            <Ribbon tone="dark">Our story</Ribbon>
            <h2 className="mt-5 font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-[2.5rem]">
              Founded to make quality mental health care reachable.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-brand-50/85">
              Founded by Egyptian psychologist Karla Meleka, Let It Out
              delivers professional mental health support tailored to your
              community&apos;s needs, reducing stigma, one mind at a time.
            </p>
            <ButtonLink href="/about" variant="bright" className="mt-9">
              Read our story
            </ButtonLink>
          </div>
          <div className="flex justify-center">
            <Logo variant="icon-white" height={200} className="drop-shadow-2xl" />
          </div>
        </Container>
      </section>

      {/* Counselors */}
      <section className="py-28">
        <Container>
          <SectionHeading
            eyebrow="Meet the team"
            title="Psychologist-led, evidence-based care"
            description="Every session is led by a licensed, specialized psychotherapist."
          />
          <Suspense
            fallback={
              <SkeletonGrid count={3} className="mt-16">
                {() => <SkeletonPersonCard />}
              </SkeletonGrid>
            }
          >
            <CounselorGrid />
          </Suspense>
        </Container>
      </section>

      {/* Shop teaser */}
      <WaveDivider fill="fill-brand-50" className="-mb-px" />
      <section className="relative overflow-hidden bg-linear-to-b from-brand-50 to-white py-28">
        <AmbientGlow palette="brand" intensity={0.12} />
        <Container className="relative">
          <SectionHeading
            eyebrow="Guided journals"
            title="Self-help tools you can hold onto"
            description="CBT-informed guided journals, paid on delivery."
          />
          <Suspense
            fallback={
              <SkeletonGrid count={2} columns="sm:grid-cols-2" className="mt-16 gap-10">
                {() => (
                  <div className="flex items-center gap-6">
                    <Skeleton className="aspect-[4/5] w-32 shrink-0 rounded-2xl" subtle />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-3/4 rounded-lg" subtle />
                      <Skeleton className="mt-3 h-3 w-20" subtle />
                      <Skeleton className="mt-4 h-3 w-24" subtle />
                    </div>
                  </div>
                )}
              </SkeletonGrid>
            }
          >
            <ProductTeaserGrid />
          </Suspense>
        </Container>
      </section>

      {/* Journal app CTA */}
      <section className="py-28">
        <Container>
          <Surface className="relative overflow-hidden px-6 py-20 text-center sm:px-16">
            <AmbientGlow palette="brand" intensity={0.22} />
            <DoodleField />
            <div className="relative">
              <SectionHeading
                align="center"
                eyebrow="In your pocket"
                title="Daily journaling prompts, whenever you need them"
                description="Create a free account for guided, self-exploration prompts and a private space to write — right on the app."
              />
              <div className="mt-10 flex justify-center gap-4">
                <ButtonLink href="/signup" variant="primary" size="lg">
                  Start journaling free
                </ButtonLink>
              </div>
            </div>
          </Surface>
        </Container>
      </section>
    </>
  );
}

async function CounselorGrid() {
  const counselors = await prisma.counselor.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  if (counselors.length === 0) {
    return (
      <EmptyState
        className="mt-16"
        illustration={<CalendarMark className="h-9 w-9" />}
        title="Our counseling roster is being updated"
        description="We're finalising availability with our psychotherapists. Send us a note and we'll match you with the right counselor as soon as the schedule reopens."
        action={<ButtonLink href="/contact">Get in touch</ButtonLink>}
      />
    );
  }

  return (
    <div className="mt-16 grid gap-7 sm:grid-cols-3">
      {counselors.map((c, i) => (
        <Link
          key={c.id}
          href={`/counseling/${c.slug}`}
          className={`group animate-rise-in block p-7 sm:p-8 ${surfaceClass()}`}
          style={{ animationDelay: `${i * 70}ms` }}
        >
          <div className="flex h-15 w-15 items-center justify-center rounded-full border border-brand-900/10 bg-brand-50 font-display text-lg font-semibold text-brand-700 shadow-ambient-sm">
            {c.name.split(" ").map((n) => n[0]).join("")}
          </div>
          <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-brand-900">
            {c.name}
          </h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{c.credentials}</p>
          <p className="link-grow mt-4 w-fit text-sm font-medium text-brand-600">
            View profile &rarr;
          </p>
        </Link>
      ))}
    </div>
  );
}

async function ProductTeaserGrid() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
    include: { variants: { where: { format: "PHYSICAL" } } },
  });

  const sellable = products.filter((p) => p.variants.length > 0);

  if (sellable.length === 0) {
    return (
      <EmptyState
        className="mt-16"
        illustration={<BagMark className="h-9 w-9" />}
        title="New journals are on the way"
        description="Our guided journals are being restocked. Start with the free in-app prompts in the meantime — same CBT-informed approach, none of the wait."
        action={<ButtonLink href="/journal">Try the journaling app</ButtonLink>}
      />
    );
  }

  return (
    <div className="mt-16 grid gap-10 sm:grid-cols-2">
      {sellable.map((p, i) => {
        const price = Math.min(...p.variants.map((v) => v.priceEGP));
        return (
          <Link
            key={p.id}
            href={`/shop/${p.slug}`}
            className={`group animate-rise-in -mx-3 flex items-center gap-6 rounded-3xl p-3 ${motionEase} ${liftPress} ${focusRing}`}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <div className="relative w-32 shrink-0 overflow-hidden rounded-2xl shadow-ambient transition-shadow duration-300 ease-out group-hover:shadow-ambient-lg">
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
              <h3 className="font-display text-lg font-semibold tracking-tight text-brand-900">
                {p.title}
              </h3>
              <Badge className="mt-2.5">{formatEGP(price)}</Badge>
              <p className="link-grow mt-3 w-fit text-sm font-medium text-brand-600">
                Shop now &rarr;
              </p>
            </div>
          </Link>
        );
      })}
    </div>
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
      className={`group relative flex flex-col p-8 ${surfaceClass()} ${offset ? "sm:mt-10" : ""}`}
    >
      <span className="font-display text-5xl font-semibold leading-none tracking-tight text-brand-100 transition-colors duration-300 ease-out group-hover:text-brand-200">
        {index}
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-brand-900">
        {title}
      </h3>
      <p className="mt-3.5 flex-1 text-sm leading-relaxed text-ink-body">{description}</p>
      <p className="link-grow mt-6 w-fit text-sm font-medium text-brand-600">
        Learn more &rarr;
      </p>
    </Link>
  );
}
