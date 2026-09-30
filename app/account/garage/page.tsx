import type { Metadata } from "next";
import Link from "next/link";
import { CarForm } from "@/components/account/car-form";
import { buttonClasses } from "@/components/ui/button";
import { deleteCarAction } from "@/app/account/actions";
import { getCarAttributes, getUserCars } from "@/lib/api/account";

export const metadata: Metadata = {
  title: "Мій гараж",
  robots: { index: false, follow: false },
};

export default async function GaragePage() {
  const [cars, attributes] = await Promise.all([
    getUserCars(),
    getCarAttributes(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[20px] font-semibold leading-[1.4] text-black-900">
          Мій гараж
        </h2>
        <p className="text-[16px] leading-[1.6] text-grey-700">
          Збережені авто підставляються в заявку на підбір — не доведеться
          щоразу диктувати менеджеру марку, рік і VIN.
        </p>
      </div>

      {cars.length > 0 && (
        <ul className="flex flex-col gap-3">
          {cars.map((car) => {
            const specs = [
              car.year ? `${car.year} р.` : null,
              car.litres ? `${car.litres} л` : null,
              car.bodyDisplay,
              car.transmissionDisplay,
              car.driveDisplay,
            ].filter(Boolean);

            return (
              <li
                key={car.id}
                className="flex flex-wrap items-start justify-between gap-4 rounded-[16px] border border-grey-200 p-5"
              >
                <div className="flex min-w-0 flex-col gap-1.5">
                  <h3 className="text-[17px] font-semibold leading-[1.4] text-black-900">
                    {car.brand} {car.model}
                    {car.modification && (
                      <span className="font-normal text-grey-700">
                        {" "}
                        {car.modification}
                      </span>
                    )}
                  </h3>

                  {specs.length > 0 && (
                    <p className="text-[14px] leading-[1.5] text-grey-700">
                      {specs.join(" · ")}
                    </p>
                  )}

                  {car.vin && (
                    <p className="tnum text-[14px] leading-[1.5] text-grey-700">
                      VIN: <span className="text-black-900">{car.vin}</span>
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/requests/create?car=${encodeURIComponent(car.id)}`}
                    className={buttonClasses({ variant: "subtle", size: "sm" })}
                  >
                    Підібрати деталь
                  </Link>

                  <form action={deleteCarAction}>
                    <input type="hidden" name="carId" value={car.id} />
                    <button
                      type="submit"
                      className="h-10 rounded-[8px] px-3 text-[14px] leading-[1.5] text-grey-700 transition-colors hover:bg-danger-50 hover:text-danger-700"
                    >
                      Видалити
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {cars.length === 0 && (
        <p className="rounded-[16px] border border-grey-200 p-6 text-[16px] leading-[1.6] text-grey-700">
          У гаражі поки порожньо. Додайте авто — і підбір деталей піде швидше.
        </p>
      )}

      <CarForm attributes={attributes} />
    </div>
  );
}
