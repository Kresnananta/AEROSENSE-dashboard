import React from "react";

interface PageHeadingProps {
  eyebrow?: string;
  title: string;
  titleAccent?: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export function PageHeading({
  eyebrow,
  title,
  titleAccent,
  description,
  badge,
  actions,
}: PageHeadingProps) {
  return (
    <header className="page-heading">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-extrabold uppercase tracking-[1.6px] text-[#6fa0ca] mb-2 flex items-center gap-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.6px] leading-[1.18] text-[#11223D]">
          {title} {titleAccent && <span className="text-[#086CFB]">{titleAccent}</span>}
        </h1>
        {description && <p className="page-heading-description">{description}</p>}
      </div>

      {(badge || actions) && (
        <div className="flex max-w-full flex-wrap items-center gap-2.5">
          {badge}
          {actions}
        </div>
      )}
    </header>
  );
}
