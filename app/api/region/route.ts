import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { regionByCode } from "@/lib/region-codes";

/**
 * Область відвідувача за IP.
 *
 * Робимо це окремим маршрутом, а не в самій смузі: смуга живе в
 * кореневому layout, і будь-яке читання заголовків там зробило б
 * динамічними геть усі статичні сторінки. Так само працює лічильник
 * кошика — сторінки лишаються в кеші, а особисте доїжджає окремо.
 *
 * Геодані дає сам Vercel із IP: ні стороннього сервісу, ні дозволу в
 * браузера. Поза Vercel заголовків немає — тоді віддаємо `null`, і
 * смуга просто питає область, як питала досі.
 */
export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country");
  const code = request.headers.get("x-vercel-ip-country-region");

  return NextResponse.json(
    { region: regionByCode(country, code) },
    {
      headers: {
        /* Приватний кеш на добу: відповідь залежить від IP, тому на
           спільний кеш її класти не можна */
        "Cache-Control": "private, max-age=86400",
      },
    },
  );
}
