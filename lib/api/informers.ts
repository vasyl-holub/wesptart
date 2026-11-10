import { gql, gqlRaw } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";
import { plainText } from "@/lib/html-text";

/* «Повідомлення для вас» зі старого кабінету: інформери, які менеджер
   або система надсилає конкретному клієнту. */

export type Informer = {
  id: string;
  subject: string;
  text: string;
  isRead: boolean;
  created: string;
  senderName: string | null;
};

export type InformersPage = {
  items: Informer[];
  totalCount: number;
  pagesCount: number;
};

const EMPTY: InformersPage = { items: [], totalCount: 0, pagesCount: 0 };

const INFORMERS = /* GraphQL */ `
  query Informers($page: Int!, $perPage: Int!, $isRead: Boolean) {
    informerAll(page: $page, perPage: $perPage, isRead: $isRead) {
      totalCount
      pagesCount
      edges {
        id
        subject
        text
        isRead
        created
        sender {
          fullName
        }
      }
    }
  }
`;

type InformersResponse = {
  informerAll: {
    totalCount: number | null;
    pagesCount: number | null;
    edges: {
      id: string;
      subject: string | null;
      text: string | null;
      isRead: boolean | null;
      created: string;
      sender: { fullName: string | null } | null;
    }[];
  } | null;
};

export async function getInformers(
  page = 1,
  perPage = 10,
  /** `undefined` — усі, `false` — лише непрочитані */
  isRead?: boolean,
): Promise<InformersPage> {
  const auth = await getApiAuth();
  if (!auth) return EMPTY;

  try {
    const data = await gql<InformersResponse>(INFORMERS, {
      auth,
      variables: { page, perPage, isRead },
    });

    const conn = data.informerAll;
    if (!conn) return EMPTY;

    return {
      items: conn.edges.map((i) => ({
        id: i.id,
        /* У темі приходять екрановані теги («&lt;br /&gt;») — лишаємо
           самий текст, бо тема йде в заголовок картки */
        subject: plainText(i.subject ?? ""),
        text: i.text ?? "",
        isRead: Boolean(i.isRead),
        created: i.created,
        senderName: i.sender?.fullName ?? null,
      })),
      totalCount: conn.totalCount ?? 0,
      pagesCount: conn.pagesCount ?? 0,
    };
  } catch {
    return EMPTY;
  }
}

/**
 * Лічильник для меню. Беремо найдешевший запит — одна сторінка з одним
 * записом заради `totalCount`, самі тексти для значка не потрібні.
 */
export async function getUnreadCount(): Promise<number> {
  const auth = await getApiAuth();
  if (!auth) return 0;

  try {
    const data = await gql<{
      informerAll: { totalCount: number | null } | null;
    }>(
      /* GraphQL */ `
        query UnreadInformers {
          informerAll(page: 1, perPage: 1, isRead: false) {
            totalCount
          }
        }
      `,
      { auth },
    );
    return data.informerAll?.totalCount ?? 0;
  } catch {
    return 0;
  }
}

type MutationPayload = { errors: ApiFieldError[] | null };

export async function markInformersRead(ids: string[]) {
  const auth = await getApiAuth();
  return gqlRaw<{ makeReadInformer: MutationPayload }>(
    /* GraphQL */ `
      mutation MarkRead($ids: [ID]!) {
        makeReadInformer(ids: $ids) {
          errors {
            field
            messages
          }
        }
      }
    `,
    { auth, variables: { ids } },
  );
}

export async function deleteInformers(ids: string[]) {
  const auth = await getApiAuth();
  return gqlRaw<{ makeDeletedInformer: MutationPayload }>(
    /* GraphQL */ `
      mutation DeleteInformers($ids: [ID]!) {
        makeDeletedInformer(ids: $ids) {
          errors {
            field
            messages
          }
        }
      }
    `,
    { auth, variables: { ids } },
  );
}
