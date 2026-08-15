import { Container, Surface } from "@/components/ui";
import { Skeleton, SkeletonText } from "@/components/skeleton";

export default function CounselorLoading() {
  return (
    <section className="py-20 sm:py-24">
      <Container className="grid gap-12 md:grid-cols-5 lg:gap-16">
        <div className="md:col-span-3">
          <Skeleton className="h-3 w-28" />
          <div className="mt-6 flex items-center gap-5">
            <Skeleton className="h-20 w-20" />
            <div className="flex-1">
              <Skeleton className="h-8 w-2/3 rounded-xl" />
              <Skeleton className="mt-3 h-3 w-1/2" />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-7 w-28" />
          </div>
          <SkeletonText className="mt-10" lines={7} />
        </div>

        <div className="md:col-span-2">
          <Surface className="p-7 sm:p-8">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <SkeletonText className="mt-4" lines={2} />
            <div className="mt-8 space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-11 w-full rounded-2xl" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-8 h-12 w-full" />
          </Surface>
        </div>
      </Container>
    </section>
  );
}
