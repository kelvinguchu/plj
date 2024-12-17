"use client";

import { cn } from "@/lib/utils";
import "./loader.css";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Loader({ className, ...props }: LoaderProps) {
  return (
    <div className={cn("loader-container", className)} {...props}>
      <div className="loader"></div>
    </div>
  );
} 