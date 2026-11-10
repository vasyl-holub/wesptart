/**
 * Ініціали для значка в шапці. Беремо те, що бекенд справді заповнює:
 * спершу ім'я з прізвищем, далі повне ім'я одним рядком, і лише як
 * останній шанс — email, бо «VA» з пошти читається гірше за «ВГ».
 */
export function initials(user: {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  email?: string | null;
}): string {
  const pair = [user.firstName, user.lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));

  if (pair.length) return take(pair);

  const words = (user.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  if (words.length) return take(words);

  /* Email на кшталт ivan.petrov@... теж складається з двох частин */
  const local = (user.email ?? "").split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length) return take(parts);

  return "";
}

function take(parts: string[]) {
  return parts
    .slice(0, 2)
    .map((part) => [...part][0]?.toLocaleUpperCase("uk") ?? "")
    .join("");
}
