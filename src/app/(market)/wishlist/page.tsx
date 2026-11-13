import { WishlistView } from "@/components/market/cart-views";
import { Container } from "@/components/market/section";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getTranslator();
  return { title: t("market.wishlist.title") };
}

export default function Page() {
  return (
    <Container className="pt-8">
      <WishlistView />
    </Container>
  );
}
