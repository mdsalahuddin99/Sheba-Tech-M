"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { useCartActions } from "@/features/pos/hooks";

/**
 * Listens for fast keystroke sequences typical of USB/Bluetooth barcode scanners
 * (rapid characters terminated by Enter) anywhere in the app.
 *
 * - Ignored when the user is typing in an editable field, modal input, or POS barcode box.
 * - On scan: if the code matches a known product → if on /pos add to cart, otherwise navigate
 *   to /products with the SKU/barcode pre-filtered.
 */
export function useGlobalBarcodeScanner() {
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart } = useCartActions();

  useEffect(() => {
    let buffer = "";
    let lastTime = 0;
    let timer: number | undefined;
    let lastScanCode = "";
    let lastScanAt = 0;

    const SCANNER_CHAR_THRESHOLD_MS = 50; // chars closer than this = scanner
    const RESET_MS = 150;
    const DEDUPE_MS = 1200;

    const isEditable = (el: EventTarget | null) => {
      if (!(el instanceof HTMLElement)) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return false;
    };

    const flush = async () => {
      const code = buffer.trim();
      buffer = "";
      if (code.length < 4) return;
      
      const now = Date.now();
      if (code === lastScanCode && now - lastScanAt < DEDUPE_MS) {
        return; // duplicate of same barcode within dedupe window
      }

      try {
        const qs = new URLSearchParams({ q: code, exact: "true" });
        const res = await fetch(`/api/products/search?${qs.toString()}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        
        const lowerCode = code.toLowerCase();
        let product = data.items?.find(
          (p: any) =>
            (p.barcode || "").toLowerCase() === lowerCode ||
            (p.sku || "").toLowerCase() === lowerCode
        );

        if (!product) {
          product = data.items?.find((p: any) => 
            p.serialNumbers?.some((s: any) => (s.serial || "").toLowerCase() === lowerCode)
          );
        }

        if (!product) {
          toast.error("Product not found");
          return;
        }

        lastScanCode = code;
        lastScanAt = now;

        const isPos = pathname.startsWith("/pos") || pathname.includes("/sales/create");
        if (isPos) {
          const b = product.globalBrand?.name ?? product.brand;
          const m = product.globalModel?.name ?? product.model;
          let finalName = product.name ?? "";
          if (b && !finalName.toLowerCase().startsWith(b.toLowerCase())) finalName = `${b} ${finalName}`;
          if (m && !finalName.toLowerCase().endsWith(m.toLowerCase())) finalName = `${finalName} - ${m}`;

          addToCart(product.id, finalName, undefined, undefined, product.bundleQty);
          toast.success(`✓ ${product.name}`);
        } else {
          toast.success(`Found: ${product.name}`);
          router.push(`/products?search=${encodeURIComponent(product.sku)}`);
        }
      } catch (err) {
        toast.error("Product not found");
      }
    };

    const onKey = (e: KeyboardEvent) => {
      // Ignore typing in editable fields — they have their own handling.
      if (isEditable(e.target)) return;

      const now = Date.now();
      const fast = now - lastTime < SCANNER_CHAR_THRESHOLD_MS;
      lastTime = now;

      if (e.key === "Enter") {
        if (buffer) {
          e.preventDefault();
          flush();
        }
        return;
      }

      // Only single-char printable keys
      if (e.key.length !== 1) return;

      if (!fast && buffer) {
        // Slow keystroke -> not scanner; reset
        buffer = "";
      }

      buffer += e.key;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (buffer.length >= 6) flush();
        buffer = "";
      }, RESET_MS);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [addToCart, router, pathname]);
}
