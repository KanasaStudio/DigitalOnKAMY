"use client";

import { useEffect } from "react";
import { removeCartLineAction, setCartLineAction, setWishlistAction, syncMarketAction } from "@/app/(market)/market-actions";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n/client";
import { market } from "./store";

/**
 * Connects the browser cart and wishlist to the signed-in account. Renders nothing.
 * Guests (and demo mode) never mount a remote, so their lists stay in this browser.
 */
export function MarketSync({ signedIn }: { signedIn: boolean }) {
  const { t } = useI18n();
  const toast = useToast();

  useEffect(() => {
    if (!signedIn) {
      market.disconnect();
      return;
    }
    let active = true;
    let warned = false;
    const onError = () => {
      // One notice is enough; a failing connection would otherwise stack a toast per click.
      if (!active || warned) return;
      warned = true;
      toast.show(t("account.sync.failed"), { tone: "error", sound: false });
    };
    market.connect({
      setCartLine: (line) => setCartLineAction(line),
      removeCartLine: (slug) => removeCartLineAction(slug),
      setWishlist: (slug, wanted) => setWishlistAction(slug, wanted),
      onError,
    });
    syncMarketAction(market.snapshot()).then(
      (result) => {
        if (!active) return;
        if (result.ok) market.hydrate(result.cart, result.wishlist);
        else if (result.reason !== "guest") onError();
      },
      () => onError(),
    );
    return () => {
      active = false;
      market.disconnect();
    };
  }, [signedIn, t, toast]);

  return null;
}
