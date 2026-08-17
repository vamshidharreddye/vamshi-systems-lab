"use client";

import { forwardRef, type HTMLAttributes, type ReactNode, type Ref } from "react";
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
  // React 19 intersects props for unions of intrinsic elements. The supported
  // tags all share the HTMLElement attributes declared by InspectableProps.
  const Tag = Component as "div";
  return (
    <Tag
      ref={ref as Ref<HTMLDivElement>}
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
