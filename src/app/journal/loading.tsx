import { Container, Surface } from "@/components/ui";
import {
  Skeleton,
  SkeletonEntryList,
  SkeletonText,
} from "@/components/skeleton";

export default function JournalLoading() {
  return (
    <Container className="py-20 sm:py-24">
      <Skeleton className="h-3 w-48" />
      <Skeleton className="mt-5 h-9 w-full max-w-lg rounded-2xl" />

      <div className="mt-7 flex flex-wrap gap-3">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-44" />
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:gap-12">
        <div className="space-y-7 lg:col-span-2">
          <Surface tone="tinted" className="p-7 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <Skeleton className="h-3 w-28" subtle />
              <Skeleton className="h-7 w-36" subtle />
            </div>
            <Skeleton className="mt-5 h-6 w-full rounded-xl" subtle />
            <Skeleton className="mt-3 h-6 w-3/5 rounded-xl" subtle />
          </Surface>

          <div>
            <Skeleton className="h-3 w-40" />
            <div className="mt-3 flex flex-wrap gap-2.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-12" />
              ))}
            </div>
          </div>

          <Surface className="p-6">
            <SkeletonText lines={5} />
          </Surface>

          <Skeleton className="h-12 w-40" />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="mt-5">
            <SkeletonEntryList count={4} />
          </div>
        </div>
      </div>
    </Container>
  );
}
