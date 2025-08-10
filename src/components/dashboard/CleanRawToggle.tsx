import React from "react";
import { Button } from "@/components/ui/button";

export type CleanMode = "clean" | "raw";

interface CleanRawToggleProps {
  value: CleanMode;
  onChange: (v: CleanMode) => void;
  size?: "sm" | "default";
}

export const CleanRawToggle: React.FC<CleanRawToggleProps> = ({ value, onChange, size = "sm" }) => {
  return (
    <div className="inline-flex rounded-md border p-0.5">
      <Button size={size} variant={value === "clean" ? "default" : "ghost"} onClick={() => onChange("clean")} aria-pressed={value === "clean"}>
        Clean
      </Button>
      <Button size={size} variant={value === "raw" ? "default" : "ghost"} onClick={() => onChange("raw")} aria-pressed={value === "raw"}>
        Raw
      </Button>
    </div>
  );
};
