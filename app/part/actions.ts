"use server";

import { updateTag } from "next/cache";
import { addProductReview } from "@/lib/api/reviews";
import { getCurrentUser } from "@/lib/api/auth";
import { GraphQLRequestError } from "@/lib/api/graphql";

export type ReviewFormState = {
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
  ok?: boolean;
};

const MIN_TEXT = 10;

export async function addReviewAction(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const productPk = String(formData.get("productPk") ?? "");
  const text = String(formData.get("text") ?? "").trim();

  if (!productPk) return { formError: "Не вказано товар" };

  const user = await getCurrentUser();
  if (!user) {
    return { formError: "Щоб залишити відгук, увійдіть у кабінет." };
  }

  if (!text)
    return { fieldErrors: { text: "Напишіть відгук" }, values: { text } };
  if (text.length < MIN_TEXT)
    return {
      fieldErrors: { text: `Хоча б ${MIN_TEXT} символів` },
      values: { text },
    };

  /* Ім'я бекенд вимагає окремим полем, хоча користувач залогінений */
  const name = user.fullName || user.firstName || "Клієнт";

  try {
    const res = await addProductReview({ productPk, name, text });
    const errors = res.data.addComment?.errors;
    if (errors?.length) {
      return {
        formError: errors[0].messages.join(" "),
        values: { text },
      };
    }
  } catch (error) {
    return {
      formError:
        error instanceof GraphQLRequestError
          ? error.message
          : "Не вдалося надіслати відгук. Спробуйте ще раз.",
      values: { text },
    };
  }

  /* updateTag, а не revalidateTag: автор має одразу побачити свій відгук,
     а не застарілий список. У Next 16 revalidateTag лише позначає теґ
     несвіжим і віддає старі дані, поки підвантажаться нові. */
  updateTag(`reviews:${productPk}`);
  return { ok: true };
}
