"use server";

import { redirect } from "next/navigation";
import { getCurrentUser, loginUser, logoutUser } from "@/lib/api/auth";
import { initials } from "@/lib/initials";
import { clearSession, saveSession } from "@/lib/api/session";
import { GraphQLRequestError } from "@/lib/api/graphql";
import type { AuthFormState } from "@/app/register/actions";

export type { AuthFormState };

export async function loginActionFn(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!username) fieldErrors.username = "Вкажіть email";
  if (!password) fieldErrors.password = "Вкажіть пароль";
  if (Object.keys(fieldErrors).length)
    return { fieldErrors, values: { username } };

  let result;
  try {
    result = await loginUser(username, password);
  } catch (error) {
    const message =
      error instanceof GraphQLRequestError
        ? error.message
        : "Не вдалося зв'язатися з сервером. Спробуйте ще раз.";
    return { formError: message, values: { username } };
  }

  const payload = result.data.loginUser;

  if (payload?.errors?.length) {
    const message = payload.errors.map((e) => e.messages.join(" ")).join(" ");
    return { formError: message, values: { username } };
  }

  /* Бекенд не позначає невдалий вхід помилкою — судимо по відсутності
     користувача у відповіді */
  if (!payload?.user) {
    return {
      formError: "Невірний email або пароль",
      values: { username },
    };
  }

  await saveSession(result.setCookie, payload.token);
  redirect("/account");
}

export async function logoutAction() {
  await logoutUser();
  await clearSession();
  redirect("/");
}

/**
 * Хто зараз у кабінеті — для значка в шапці. Шапка живе в кореневому
 * layout, тому питати це на сервері не можна: запит до API зробив би
 * динамічними всі статичні сторінки. Тому так само, як з лічильником
 * кошика — дія, яку смикає клієнтський компонент після монтування.
 */
export async function currentUserBadgeAction(): Promise<{
  initials: string;
  name: string;
} | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") ||
    user.fullName ||
    user.email ||
    "";

  return { initials: initials(user), name };
}
