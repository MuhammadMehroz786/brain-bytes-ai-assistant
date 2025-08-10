import React from "react";

export const LeftStripe: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-y-0 left-0 w-[3px] rounded-l-md"
      style={{ backgroundColor: "hsl(var(--cat-current))" }}
    />
  );
};
