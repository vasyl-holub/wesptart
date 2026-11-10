import { permanentRedirect } from "next/navigation";
import { getCarBrands } from "@/lib/api/catalog";

/**
 * Старий сайт тримав марки авто за /brands/<slug>/ — 78 індексованих
 * адрес. У нас це /catalog/car/<slug>/, але slug збігається не завжди:
 * бекенд має два дерева авто, і в тому, на якому працює новий каталог,
 * частина марок названа інакше або відсутня.
 *
 * Тому це не правило в next.config, а сторінка: вона дивиться в живий
 * довідник і веде на марку, якщо та є. Коли довідник поповнять, редірект
 * почне влучати точніше сам, без правок тут.
 */

/** Ті самі марки, названі в новому дереві інакше */
const ALIASES: Record<string, string> = {
  "mercedes-benz": "mercedes",
  vw: "volkswagen",
  lada: "lada-avtowaz",
  mg: "rover-mg",
  rover: "rover-mg",
  "ford-usa": "ford",
  "tesla-2": "tesla",
};

export default async function OldBrandPage({
  params,
}: PageProps<"/brands/[slug]">) {
  const { slug } = await params;
  const target = ALIASES[slug] ?? slug;

  const brands = await getCarBrands();
  const exists = brands.some((b) => b.slug === target);

  /* Марки без відповідника (maybach, daf, scania та інші вантажні й
     рідкісні) ведемо в каталог — це найближча за змістом сторінка.
     На головну не відправляємо: ТЗ прямо це забороняє. */
  permanentRedirect(exists ? `/catalog/car/${target}/` : "/catalog/");
}
