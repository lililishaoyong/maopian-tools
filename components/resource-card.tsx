import Image from "next/image";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Resource } from "@/lib/types";

export function ResourceCard({ resource, compact = false }: { resource: Resource; compact?: boolean }) {
  return (
    <article className="rounded-2xl border border-cream-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Link className="shrink-0" href={`/tools/${resource.slug}`}>
          <Image
            alt=""
            className="size-12 rounded-xl border border-cream-200 bg-brand-100 object-cover"
            height={48}
            src={resource.iconUrl}
            width={48}
          />
        </Link>
        <Link className="min-w-0 flex-1" href={`/tools/${resource.slug}`}>
          <h3 className="truncate text-[15px] font-bold text-cream-900">{resource.name}</h3>
          {!compact && <p className="mt-1 line-clamp-1 text-xs text-cream-500">{resource.description}</p>}
        </Link>
        <Link
          className="inline-flex shrink-0 items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1.5 text-[11px] font-bold text-brand-700"
          href={`/view/${resource.slug}`}
        >
          站内打开
          <ExternalLink className="size-3" />
        </Link>
      </div>
    </article>
  );
}

export function MiniResourceCard({ resource }: { resource: Resource }) {
  return (
    <Link className="block rounded-2xl border border-cream-200 bg-white p-3 shadow-sm" href={`/tools/${resource.slug}`}>
      <Image
        alt=""
        className="size-11 rounded-xl border border-cream-200 bg-brand-100 object-cover"
        height={44}
        src={resource.iconUrl}
        width={44}
      />
      <h3 className="mt-2 truncate text-xs font-bold text-cream-900">{resource.name}</h3>
      <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-cream-500">{resource.description}</p>
    </Link>
  );
}
