import { Container } from "@/components/ui";
import {
  SkeletonCard,
  SkeletonGrid,
  SkeletonHero,
  SkeletonSectionHeading,
} from "@/components/skeleton";

export default function ResourcesLoading() {
  return (
    <>
      <SkeletonHero />
      <section className="py-20 sm:py-24">
        <Container>
          <SkeletonSectionHeading />
          <SkeletonGrid count={4} columns="sm:grid-cols-2" className="mt-14">
            {() => <SkeletonCard />}
          </SkeletonGrid>
        </Container>
      </section>
    </>
  );
}
