"use client";

import { forwardRef, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { InspectionMetadata } from "@/types/inspection";
import { useXRay } from "./XRayProvider";

type InspectableElement = "article" | "aside" | "div" | "header" | "main" | "section";

interface InspectableProps extends HTMLAttributes<HTMLElement> {
  as?: InspectableElement;
  metadata: InspectionMetadata;
  children: ReactNode;
}

export const Inspectable = forwardRef<HTMLElement, InspectableProps>(function Inspectable(
  { metadata, children, className, as: Component = "div", ...props },
  ref
) {
  const { enabled } = useXRay();
  const Tag = Component as ElementType;
  return (
    <Tag
      ref={ref}
      className={cn("inspectable", enabled && "is-inspected", className)}
      data-inspect-id={metadata.id}
      data-inspect-relationship={metadata.relationship || undefined}
      data-component={metadata.component}
      {...props}
    >
      {children}
      {enabled ? (
        <span
          className="inspection-tag"
          tabIndex={0}
          aria-label={`${metadata.component}. ${metadata.execution} execution. Source: ${metadata.source}. Route: ${metadata.route}.`}
        >
          <strong>{metadata.component}</strong>
          <span>exec:{metadata.execution}</span>
          <span>source:{metadata.source}</span>
          <span>route:{metadata.route}</span>
          {metadata.cache ? <span>cache:{metadata.cache}</span> : null}
          {metadata.relationship ? <span>rel:{metadata.relationship}</span> : null}
        </span>
      ) : null}
    </Tag>
  );
});
