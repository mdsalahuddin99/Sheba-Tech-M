"use client";

import { useEffect } from "react";

/**
 * Set the document title for client components.
 * Works with the layout's `title.template` pattern ("%s | Sheba Tech").
 *
 * Usage:
 * ```tsx
 * usePageTitle("Products");
 * // → <title>Products | Sheba Tech</title>
 * ```
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | Sheba Tech`;
    return () => {
      document.title = prev;
    };
  }, [title]);
}
