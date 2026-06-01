"use client";

import { useId, useMemo, useState } from "react";
import clsx from "clsx";
import { Search } from "lucide-react";
import { resolveLucideIcon, lucideIconNames, suggestedCategoryIcons } from "@/lib/lucide-icons";

type IconNameFieldProps = {
  className?: string;
  label: string;
  name: string;
  value?: string;
};

export function IconNameField({ className, label, name, value = "Clapperboard" }: IconNameFieldProps) {
  const [iconName, setIconName] = useState(value);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dataListId = `${useId()}-lucide-icons`;
  const inputId = `${dataListId}-input`;
  const filteredIcons = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return lucideIconNames;

    return lucideIconNames.filter((icon) => icon.toLowerCase().includes(keyword));
  }, [query]);
  const visibleIcons = filteredIcons.slice(0, 180);

  function chooseIcon(nextIconName: string) {
    setIconName(nextIconName);
    setIsPickerOpen(false);
  }

  return (
    <div className={clsx("grid gap-2 text-sm text-stone-600", className)}>
      <label className="grid gap-1" htmlFor={inputId}>
        {label}
      </label>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
        <input
          className="h-12 rounded-lg border border-stone-200 px-3 py-2 text-stone-900"
          id={inputId}
          list={dataListId}
          name={name}
          onChange={(event) => setIconName(event.currentTarget.value)}
          type="text"
          value={iconName}
        />
        <IconPreview name={iconName} />
        <button
          className="inline-flex h-12 items-center justify-center gap-1.5 rounded-lg border border-brand-100 bg-white px-4 text-sm font-semibold text-brand-700 transition hover:bg-brand-50"
          onClick={() => setIsPickerOpen((open) => !open)}
          type="button"
        >
          <Search className="size-4" />
          选择图标
        </button>
      </div>
      <datalist id={dataListId}>
        {lucideIconNames.map((icon) => (
          <option key={icon} value={icon} />
        ))}
      </datalist>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {suggestedCategoryIcons.map((icon) => (
          <IconChoiceButton iconName={icon} key={icon} onChoose={chooseIcon} />
        ))}
      </div>
      {isPickerOpen && (
        <div className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
              <input
                className="h-10 w-full rounded-lg border border-stone-200 pl-9 pr-3 text-stone-900"
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="搜索图标名"
                type="search"
                value={query}
              />
            </label>
            <span className="text-xs font-medium text-stone-400">
              {filteredIcons.length} 个匹配
            </span>
          </div>
          <div className="mt-3 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {visibleIcons.map((icon) => (
              <IconPickerButton active={icon === iconName} iconName={icon} key={icon} onChoose={chooseIcon} />
            ))}
          </div>
          {visibleIcons.length < filteredIcons.length && (
            <p className="mt-2 text-xs text-stone-400">继续输入可缩小范围。</p>
          )}
        </div>
      )}
    </div>
  );
}

export function IconPreview({ compact = false, name }: { compact?: boolean; name: string }) {
  const { Icon, isValid, name: resolvedName } = resolveLucideIcon(name);

  return (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-lg border px-2.5 text-left",
        compact ? "h-9" : "h-12",
        isValid ? "border-brand-100 bg-brand-50 text-brand-700" : "border-amber-200 bg-amber-50 text-amber-700"
      )}
    >
      <span className={clsx("grid shrink-0 place-items-center rounded-md bg-white", compact ? "size-7" : "size-8")}>
        <Icon className={compact ? "size-4" : "size-5"} />
      </span>
      <span className="min-w-0">
        <span className={clsx("block truncate font-semibold", compact ? "max-w-24 text-xs" : "max-w-28 text-sm")}>
          {resolvedName}
        </span>
        {!compact && <span className="block text-xs font-medium opacity-70">{isValid ? "当前样式" : "未匹配"}</span>}
      </span>
    </span>
  );
}

function IconChoiceButton({ iconName, onChoose }: { iconName: string; onChoose: (iconName: string) => void }) {
  const { Icon } = resolveLucideIcon(iconName);

  return (
    <button
      aria-label={iconName}
      className="grid size-8 place-items-center rounded-lg border border-stone-200 bg-white text-stone-600 transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
      onClick={() => onChoose(iconName)}
      title={iconName}
      type="button"
    >
      <Icon className="size-4" />
    </button>
  );
}

function IconPickerButton({
  active,
  iconName,
  onChoose
}: {
  active: boolean;
  iconName: string;
  onChoose: (iconName: string) => void;
}) {
  const { Icon } = resolveLucideIcon(iconName);

  return (
    <button
      className={clsx(
        "flex h-11 min-w-0 items-center gap-2 rounded-lg border px-2 text-left transition",
        active
          ? "border-brand-200 bg-brand-50 text-brand-700"
          : "border-stone-200 bg-white text-stone-600 hover:border-brand-100 hover:bg-brand-50"
      )}
      onClick={() => onChoose(iconName)}
      title={iconName}
      type="button"
    >
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-white">
        <Icon className="size-4" />
      </span>
      <span className="truncate text-xs font-semibold">{iconName}</span>
    </button>
  );
}
