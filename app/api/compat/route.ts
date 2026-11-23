import { NextResponse } from "next/server";
import { getCarFits } from "@/lib/api/car-fits";

/**
 * Застосовність товару: на які авто він стає.
 *
 * Окремий роут, а не частина сторінки товару: список буває на півтори
 * тисячі рядків, а дивляться його одиниці. Тож він їде лише тоді, коли
 * на значок авто справді навели або натиснули.
 *
 * `brief=1` віддає тільки підсумок для підказки — щоб наведення мишею
 * не тягнуло сотню кілобайт, які потрібні лише у вікні.
 */
export const dynamic = "force-dynamic";
/* Той самий регіон, що й решта функцій: Cloudflare бекенду пускає ЄС */
export const preferredRegion = "fra1";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const id = params.get("id")?.trim();
  if (!id) return NextResponse.json({ total: 0, summary: "", brands: [] });

  const fits = (await getCarFits(id)) ?? { total: 0, summary: "", brands: [] };
  const brief = params.get("brief") === "1";

  return NextResponse.json(brief ? { ...fits, brands: [] } : fits, {
    headers: {
      /* Застосовність однакова для всіх, тому кеш спільний */
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
