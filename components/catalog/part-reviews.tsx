import Link from "next/link";
import { Container } from "@/components/ui/container";
import { StarFilledIcon, StarIcon } from "@/components/ui/icons";
import { ReviewForm } from "@/components/catalog/review-form";
import { getProductReviews } from "@/lib/api/reviews";
import { getCurrentUser } from "@/lib/api/auth";
import { formatDate } from "@/lib/format-date";
import { pluralize } from "@/lib/plural";

/** Оцінка на бекенді десятибальна, а зірочок показуємо п'ять */
function stars(vote: number | null) {
  if (vote === null) return null;
  return Math.round(vote / 2);
}

export async function PartReviews({
  productPk,
  rating,
  voteCount,
}: {
  productPk: string;
  rating: number;
  voteCount: number;
}) {
  const [reviews, user] = await Promise.all([
    getProductReviews(productPk),
    getCurrentUser(),
  ]);

  return (
    <section id="reviews" className="py-12 lg:py-16">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[24px] font-semibold leading-[1.4] text-black-900 lg:text-[32px]">
            Відгуки
          </h2>

          {voteCount > 0 && (
            <div className="flex items-center gap-2.5">
              <span className="flex gap-0.5">
                {Array.from({ length: 5 }, (_, i) =>
                  i < Math.round(rating) ? (
                    <StarFilledIcon key={i} className="size-5 text-star" />
                  ) : (
                    <StarIcon key={i} className="size-5 text-grey-300" />
                  ),
                )}
              </span>
              <span className="tnum text-[15px] leading-[1.5] text-grey-700">
                {rating.toFixed(1)} ·{" "}
                {pluralize(voteCount, "оцінка", "оцінки", "оцінок")}
              </span>
            </div>
          )}
        </div>

        {reviews.length > 0 ? (
          <ul className="grid gap-4 lg:grid-cols-2">
            {reviews.map((r) => {
              const s = stars(r.vote);
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-2.5 rounded-[16px] border border-grey-200 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span className="text-[16px] font-semibold leading-[1.5] text-black-900">
                      {r.author}
                    </span>
                    <span className="text-[13px] leading-[1.45] text-grey-600">
                      {formatDate(r.created)}
                    </span>
                  </div>

                  {s !== null && (
                    <span className="flex gap-0.5">
                      {Array.from({ length: 5 }, (_, i) =>
                        i < s ? (
                          <StarFilledIcon
                            key={i}
                            className="size-4 text-star"
                          />
                        ) : (
                          <StarIcon key={i} className="size-4 text-grey-300" />
                        ),
                      )}
                    </span>
                  )}

                  <p className="text-[15px] leading-[1.55] text-grey-700">
                    {r.text}
                  </p>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[16px] leading-[1.6] text-grey-700">
            Про цю деталь ще ніхто не писав. Якщо ви її вже поставили —
            розкажіть, чи підійшла: це найкорисніше для наступного покупця.
          </p>
        )}

        <div className="flex flex-col gap-4 rounded-[16px] bg-blue-25 p-5 sm:p-6">
          <h3 className="text-[18px] font-semibold leading-[1.4] text-black-900">
            Залишити відгук
          </h3>

          {user ? (
            <ReviewForm productPk={productPk} />
          ) : (
            /* Анонімний шлях лишаємо закритим свідомо: мутація
               addCommentAnonymous падає на бекенді через капчу */
            <p className="text-[15px] leading-[1.55] text-grey-700">
              Відгуки залишають клієнти з кабінетом — так ми впевнені, що людина
              справді купувала деталь.{" "}
              <Link
                href="/login"
                className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
              >
                Увійти
              </Link>{" "}
              або{" "}
              <Link
                href="/register"
                className="font-semibold text-blue-300 transition-opacity hover:opacity-80"
              >
                зареєструватися
              </Link>
              .
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
