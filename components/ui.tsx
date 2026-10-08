"use client";

import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-cards border border-hairline bg-paper p-5 shadow-subtle ${className}`}
    >
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-heading-sm font-semibold text-ink md:text-heading">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-body text-mid-gray">{subtitle}</p>}
      </div>
      {right && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{right}</div>
      )}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "ghost" | "outline" | "danger";
  disabled?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex h-9 items-center justify-center gap-2 whitespace-nowrap rounded-buttons px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mid-gray disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    primary: "bg-ink text-[#fafafa] hover:bg-ink-soft",
    ghost: "bg-canvas text-ink hover:bg-hairline",
    outline: "border border-hairline bg-transparent text-ink hover:bg-canvas",
    danger: "border border-hairline bg-transparent text-ember hover:bg-canvas",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-caption text-mid-gray">{hint}</span>}
    </label>
  );
}

const inputClass =
  "w-full rounded-inputs border border-transparent bg-canvas px-2.5 py-2 text-body text-ink outline-none transition-colors placeholder:text-mid-gray focus:border-hairline focus:bg-paper";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Textarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className={`${inputClass} min-h-20 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${inputClass} ${props.className ?? ""}`} />;
}

export function Badge({
  children,
  variant = "soft",
}: {
  children: ReactNode;
  variant?: "solid" | "soft" | "outline";
}) {
  const base =
    "inline-flex items-center whitespace-nowrap rounded-badges px-2 py-0.5 text-caption font-medium";
  const variants = {
    solid: "bg-ink-soft text-[#fafafa]",
    soft: "bg-canvas text-ink-soft",
    outline: "border border-hairline bg-transparent text-ink",
  };
  return <span className={`${base} ${variants[variant]}`}>{children}</span>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-cards border border-dashed border-hairline px-5 py-10 text-center text-body text-mid-gray">
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <p className="text-caption font-medium uppercase text-mid-gray">{label}</p>
      <p className="mt-2 text-heading font-semibold text-ink lg:text-heading-lg">
        {value}
      </p>
    </Card>
  );
}
