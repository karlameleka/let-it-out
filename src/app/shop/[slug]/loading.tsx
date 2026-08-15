import { Container } from "@/components/ui";
import { Skeleton, SkeletonText } from "@/components/skeleton";

export default function ProductLoading() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="grid gap-12 md:grid-cols-2 lg:gap-16">
        <Skeleton className="mx-auto aspect-[4/5] w-full max-w-sm rounded-3xl" />
        <div>
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-5 h-9 w-4/5 rounded-2xl" />
          <SkeletonText className="mt-7" lines={4} />
          <Skeleton className="mt-10 h-8 w-40 rounded-xl" />
          <div className="mt-7 flex flex-wrap gap-3">
            <Skeleton className="h-12 w-36" />
            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </Container>
    </section>
  );
}
