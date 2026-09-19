import { Container } from "@/components/ui";
import { Skeleton, SkeletonRows } from "@/components/skeleton";

export default function ProfileLoading() {
  return (
    <Container className="py-10">
      <div className="flex items-center gap-3">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3.5 w-56" />
        </div>
      </div>
      <SkeletonRows count={4} className="mt-8" lineClassName="h-20 rounded-2xl" />
    </Container>
  );
}
