import type { Route } from "next";
import Link from "next/link";

import { JsonLd } from "@/components/common/json-ld";
import { getBaseConfig } from "@/lib/config";

type BreadcrumbItem = {
  href?: string;
  label: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { SITE_URL } = getBaseConfig();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: `${SITE_URL}${item.href}` } : {})
          }))
        }}
      />
      <nav aria-label="Breadcrumb" className="eyebrow flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <span key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? (
              <Link href={item.href as Route} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground" aria-current="page">
                {item.label}
              </span>
            )}
            {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
          </span>
        ))}
      </nav>
    </>
  );
}
