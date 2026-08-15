import { Container } from "@/components/ui";
import { Skeleton, SkeletonEntryCard, SkeletonGrid } from "@/components/skeleton";

export default function JournalHistoryLoading() {
  return (
    <Container className="py-20 sm:py-24">
      <Skeleton className="h-3 w-32" />
      <Skeleton className="mt-5 h-9 w-72 rounded-2xl" />
      <Skeleton className="mt-5 h-3 w-96 max-w-full" />

      <SkeletonGrid
        count={6}
        columns="sm:grid-cols-2"
        className="mt-12"
      >
        {() => <SkeletonEntryCard />}
      </SkeletonGrid>
    </Container>
  );
}
