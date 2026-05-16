import React from "react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ReadoutValueProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  unit?: string;
  accent?: "primary" | "accent" | "destructive" | "muted";
  tooltip?: string;
}

export function ReadoutValue({ 
  label, 
  value, 
  unit, 
  accent = "primary",
  tooltip,
  className, 
  ...props 
}: ReadoutValueProps) {
  const content = (
    <div 
      className={cn(
        "flex flex-col bg-card/50 rounded-lg p-4 border shadow-sm border-border/50",
        className
      )} 
      {...props}
    >
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span className={cn(
          "text-3xl font-mono tracking-tight",
          accent === "primary" && "text-primary",
          accent === "accent" && "text-accent",
          accent === "destructive" && "text-destructive",
          accent === "muted" && "text-muted-foreground"
        )}>
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-muted-foreground ml-1">
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent className="bg-popover border-border text-popover-foreground">
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
