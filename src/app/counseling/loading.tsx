import { Container } from "@/components/ui";
import {
  SkeletonHero,
  SkeletonPersonCard,
  SkeletonGrid,
  SkeletonSectionHeading,
} from "@/components/skeleton";

export default function CounselingLoading() {
  return (
    <>
      <SkeletonHero />
      <section className="py-20 sm:py-24">
        <Container>
          <SkeletonSectionHeading />
          <SkeletonGrid
            count={3}
            columns="sm:grid-cols-2 lg:grid-cols-3"
            className="mt-14"
          >
            {() => <SkeletonPersonCard />}
          </SkeletonGrid>
        </Container>
      </section>
    </>
  );
}
