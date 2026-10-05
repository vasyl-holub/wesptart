import { Container } from "@/components/ui/container";
import { ReviewsPanel } from "@/components/catalog/reviews-panel";
import { getProductReviews } from "@/lib/api/reviews";
import { getCurrentUser } from "@/lib/api/auth";

export async function PartReviews({
  productPk,
  rating,
  voteCount,
}: {
  productPk: string;
  rating: number;
  voteCount: number;
}) {
  const [data, user] = await Promise.all([
    getProductReviews(productPk),
    getCurrentUser(),
  ]);

  /* Товар знає загальну кількість оцінок, але розподіл по зірках
     рахується з коментарів. Якщо бекенд віддав менше, ніж обіцяв
     лічильник товару, беремо більше з двох — інакше підпис
     «на основі N оцінок» суперечив би зірочкам угорі сторінки. */
  const votes = Math.max(voteCount, data.votes);

  return (
    <section id="reviews" className="pb-12 lg:pb-16">
      <Container>
        <ReviewsPanel
          productPk={productPk}
          rating={rating}
          votes={votes}
          distribution={data.distribution}
          items={data.items}
          canReview={Boolean(user)}
        />
      </Container>
    </section>
  );
}
