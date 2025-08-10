import React from "react";
import { cn } from "@/lib/utils";

interface TokenChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
}

export const TokenChip: React.FC<TokenChipProps> = ({ label, className, ...props }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px]",
        className
      )}
      style={{
        backgroundColor: "hsl(var(--cat-current) / 0.10)",
        color: "hsl(var(--cat-current))",
      }}
      {...props}
    >
      {label}
    </span>
  );
};
