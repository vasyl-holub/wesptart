import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import {
  ExternalLinkIcon,
  FileSpreadsheetIcon,
  PrinterIcon,
} from "@/components/ui/icons";
import type { IconProps } from "@/components/ui/icons";

type Doc = {
  href: string;
  label: string;
  title: string;
  Icon: (props: IconProps) => React.ReactElement;
};

/**
 * Друк, вигрузка в Excel і чек — усі три документи генерує бекенд і віддає
 * готовими URL, тому тут лише посилання. Відкриваємо їх у новій вкладці:
 * для сторінки друку це зберігає кабінет відкритим, а для файлу вкладка
 * закривається сама, щойно браузер підхопить завантаження.
 */
export function OrderDocs({
  printUrl,
  csvUrl,
  checkUrl = null,
  compact = false,
  className,
}: {
  printUrl: string | null;
  csvUrl: string | null;
  checkUrl?: string | null;
  /** У картці списку кнопки тихіші, щоб не змагалися з «Деталі замовлення» */
  compact?: boolean;
  className?: string;
}) {
  const docs: Doc[] = [
    printUrl && {
      href: printUrl,
      label: "Друк",
      title: "Відкрити замовлення у вигляді для друку",
      Icon: PrinterIcon,
    },
    csvUrl && {
      href: csvUrl,
      label: "Excel",
      title: "Завантажити замовлення таблицею",
      Icon: FileSpreadsheetIcon,
    },
    checkUrl && {
      href: checkUrl,
      label: "Чек",
      title: "Відкрити чек замовлення",
      Icon: ExternalLinkIcon,
    },
  ].filter(Boolean) as Doc[];

  /* Бекенд не дає URL, поки документ не сформований — тоді й рядка немає */
  if (!docs.length) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {docs.map(({ href, label, title, Icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          title={title}
          className={buttonClasses({
            variant: compact ? "ghost" : "outline",
            size: "sm",
            className: compact ? "px-3" : undefined,
          })}
        >
          <Icon className="size-4.5 shrink-0" />
          {label}
        </a>
      ))}
    </div>
  );
}
