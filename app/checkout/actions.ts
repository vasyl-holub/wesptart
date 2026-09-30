"use server";

import { revalidatePath } from "next/cache";
import { gql } from "@/lib/api/graphql";
import { getApiAuth } from "@/lib/api/session";
import type { ApiFieldError } from "@/lib/api/auth";

export type CheckoutState = {
  orderNumber?: string;
  formError?: string;
  fieldErrors?: Record<string, string>;
  values?: Record<string, string>;
};

const ADD_ORDER = /* GraphQL */ `
  mutation AddOrder($data: AddOrderMutationInput!) {
    addOrder(input: $data) {
      order {
        id
        number
      }
      errors {
        field
        messages
      }
    }
  }
`;

const LABELS: Record<string, string> = {
  delivery: "спосіб доставки",
  payMethod: "спосіб оплати",
  recipient: "отримувача",
  phone: "телефон",
};

export async function createOrderAction(
  _prev: CheckoutState,
  formData: FormData,
): Promise<CheckoutState> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const flag = (k: string) => formData.get(k) === "on";

  const values = {
    delivery: get("delivery"),
    payMethod: get("payMethod"),
    recipient: get("recipient"),
    phone: get("phone"),
    city: get("city"),
    address: get("address"),
    comment: get("comment"),
  };

  const fieldErrors: Record<string, string> = {};
  for (const key of ["delivery", "payMethod", "recipient", "phone"] as const) {
    if (!values[key]) fieldErrors[key] = `Вкажіть ${LABELS[key]}`;
  }
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  const auth = await getApiAuth();
  if (!auth?.sessionid) {
    return { formError: "Сесія завершилась. Увійдіть і повторіть.", values };
  }

  const data = {
    delivery: values.delivery,
    payMethod: values.payMethod,
    recipient: values.recipient,
    phone: values.phone,
    ...(values.city && { city: values.city }),
    ...(values.address && { address: values.address }),
    ...(values.comment && { comment: values.comment }),
    needInvoice: flag("needInvoice"),
    dontCall: flag("dontCall"),
  };

  try {
    const res = await gql<{
      addOrder: {
        order: { id: string; number: string | null } | null;
        errors: ApiFieldError[] | null;
      } | null;
    }>(ADD_ORDER, { variables: { data }, auth });

    const errors = res.addOrder?.errors ?? [];
    if (errors.length) {
      const byField: Record<string, string> = {};
      let formError: string | undefined;
      for (const e of errors) {
        const text = [...new Set(e.messages)].join(" ");
        if (e.field === "__all__" || e.field === "non_field_errors")
          formError = text;
        else byField[e.field] = text;
      }
      return { formError, fieldErrors: byField, values };
    }

    /* Кошик після замовлення порожній — скидаємо його кеш */
    revalidatePath("/cart");

    return { orderNumber: res.addOrder?.order?.number ?? "—" };
  } catch {
    return {
      formError:
        "Не вдалося оформити замовлення. Спробуйте ще раз або зателефонуйте нам.",
      values,
    };
  }
}
