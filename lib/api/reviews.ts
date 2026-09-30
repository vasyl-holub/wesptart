import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";

/**
 * Відгуки живуть у спільній таблиці коментарів, прив'язаній через
 * Django ContentType. Тому фільтр приймає **relay-id**, а не сирий
 * номер: `objectId` це base64("ProductNode:<pk>"), а `contentType` —
 * base64("ContentTypeNode:<pk>"). З сирими числами запит тихо віддає 0.
 */
function globalId(type: string, pk: string) {
  return Buffer.from(`${type}:${pk}`, "utf8").toString("base64");
}

/** Id типу «product» різний на різних інсталяціях — не хардкодимо */
async function getProductContentTypeId(): Promise<string | null> {
  try {
    const data = await gql<{
      contentTypeAll: { edges: { id: string; model: string }[] } | null;
    }>(
      /* GraphQL */ `
        query ContentTypes {
          contentTypeAll(page: 1, perPage: 200) {
            edges {
              id
              model
            }
          }
        }
      `,
      { revalidate: 60 * 60 * 24, tags: ["content-types"] },
    );
    return (
      data.contentTypeAll?.edges.find((c) => c.model === "product")?.id ?? null
    );
  } catch {
    return null;
  }
}

export type Review = {
  id: string;
  author: string;
  text: string;
  /** Оцінка за десятибальною шкалою; null — відгук без оцінки */
  vote: number | null;
  created: string;
};

const REVIEWS = /* GraphQL */ `
  query ProductReviews($objectId: ID, $contentType: ID) {
    commentAll(
      objectId: $objectId
      contentType: $contentType
      isDeleted: false
      orderBy: "-created"
      page: 1
      perPage: 50
    ) {
      totalCount
      edges {
        id
        name
        text
        vote
        created
      }
    }
  }
`;

export async function getProductReviews(productPk: string): Promise<Review[]> {
  const contentType = await getProductContentTypeId();
  if (!contentType) return [];

  try {
    const data = await gql<{
      commentAll: {
        edges: {
          id: string;
          name: string | null;
          text: string | null;
          vote: number | null;
          created: string;
        }[];
      } | null;
    }>(REVIEWS, {
      variables: {
        objectId: globalId("ProductNode", productPk),
        contentType,
      },
      /* Відгуки не персональні — кешуємо на годину */
      revalidate: 60 * 60,
      tags: ["reviews", `reviews:${productPk}`],
    });

    return (
      (data.commentAll?.edges ?? [])
        /* Більшість записів — самі лише оцінки без тексту: вони вже
         враховані в зірочках біля назви, окремо показувати нічого */
        .filter((c) => c.text?.trim())
        .map((c) => ({
          id: c.id,
          author: c.name?.trim() || "Клієнт",
          text: c.text!.trim(),
          vote: c.vote,
          created: c.created,
        }))
    );
  } catch {
    return [];
  }
}

/**
 * Залишити відгук може лише залогінений: анонімна `addCommentAnonymous`
 * вимагає капчу й падає на бекенді з тією самою помилкою, що й addClaim
 * («unexpected keyword argument 'g-recaptcha-response'»). У `addComment`
 * капчі немає, тому цей шлях робочий.
 */
export async function addProductReview(input: {
  productPk: string;
  name: string;
  text: string;
}) {
  const auth = await getApiAuth();
  const contentId = await getProductContentTypeId();

  return gqlRaw<{ addComment: { errors: ApiFieldError[] | null } }>(
    /* GraphQL */ `
      mutation AddComment($input: AddCommentMutationInput!) {
        addComment(input: $input) {
          errors {
            field
            messages
          }
        }
      }
    `,
    {
      auth,
      variables: {
        input: {
          contentId,
          objectId: globalId("ProductNode", input.productPk),
          name: input.name,
          text: input.text,
        },
      },
    },
  );
}
