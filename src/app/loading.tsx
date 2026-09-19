import { Container } from "@/components/ui";
import { Skeleton, SkeletonRows } from "@/components/skeleton";

export default function HomeLoading() {
  return (
    <Container className="py-14 sm:py-20">
      <div className="mx-auto max-w-2xl space-y-3 text-center">
        <Skeleton className="mx-auto h-4 w-32" />
        <Skeleton className="mx-auto h-10 w-full max-w-lg" />
        <Skeleton className="mx-auto h-4 w-full max-w-md" />
      </div>
      <SkeletonRows count={3} className="mx-auto mt-10 grid max-w-4xl gap-4 space-y-0 sm:grid-cols-3" lineClassName="h-40 rounded-3xl" />
    </Container>
  );
}
