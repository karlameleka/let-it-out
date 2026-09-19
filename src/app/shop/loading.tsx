import { Container } from "@/components/ui";
import { Skeleton, SkeletonRows } from "@/components/skeleton";

export default function ShopLoading() {
  return (
    <Container className="py-14 sm:py-20">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-3 h-9 w-full max-w-md" />
      <SkeletonRows count={6} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 space-y-0" lineClassName="h-64 rounded-3xl" />
    </Container>
  );
}
