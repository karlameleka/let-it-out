import { Container } from "@/components/ui";
import {
  SkeletonHero,
  SkeletonProductCard,
  SkeletonGrid,
  SkeletonSectionHeading,
} from "@/components/skeleton";

export default function ShopLoading() {
  return (
    <>
      <SkeletonHero />
      <section className="py-20 sm:py-24">
        <Container>
          <SkeletonSectionHeading />
          <SkeletonGrid
            count={2}
            columns="sm:grid-cols-2"
            className="mt-14 gap-x-8 gap-y-16"
          >
            {() => <SkeletonProductCard />}
          </SkeletonGrid>
        </Container>
      </section>
    </>
  );
}
