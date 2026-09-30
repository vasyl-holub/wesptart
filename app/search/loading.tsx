import { Container } from "@/components/ui/container";

/**
 * Скелет ставимо лише там, де сторінка ніколи не віддає notFound().
 * Щойно починається стрімінг, статус відповіді вже 200 і змінити його
 * не можна — на сторінках товару й категорій це зіпсувало б 404
 * під час переїзду зі старого сайту.
 */
export default function SearchLoading() {
  return (
    <section className="py-8 lg:py-12">
      <Container className="flex flex-col gap-8">
        <div className="h-9 w-64 animate-pulse rounded-[8px] bg-grey-100" />
        <div className="h-12 w-full max-w-[560px] animate-pulse rounded-[8px] bg-grey-100" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <li key={i} className="flex flex-col gap-4">
              <div className="h-66 animate-pulse rounded-[24px] bg-grey-100 sm:h-58" />
              <div className="h-5 w-3/4 animate-pulse rounded-[4px] bg-grey-100" />
              <div className="h-5 w-1/3 animate-pulse rounded-[4px] bg-grey-100" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
