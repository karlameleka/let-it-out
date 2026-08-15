import { Container, Surface } from "@/components/ui";
import { Skeleton, SkeletonText } from "@/components/skeleton";

export default function JournalEntryLoading() {
  return (
    <Container className="max-w-3xl py-20 sm:py-24">
      <Skeleton className="h-3 w-32" />

      <div className="mt-8 flex items-center justify-between">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-8 w-8" />
      </div>

      <Surface tone="tinted" className="mt-6 p-6">
        <Skeleton className="h-3 w-24" subtle />
        <Skeleton className="mt-4 h-5 w-4/5 rounded-lg" subtle />
      </Surface>

      <SkeletonText className="mt-10" lines={8} />
    </Container>
  );
}
