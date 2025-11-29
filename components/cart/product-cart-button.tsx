"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addProductToCart, isProductInCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";
import { useSchoolPath } from "@/components/providers/school-provider";
import { useTranslation } from "@/lib/i18n/hooks";
import type { ProductSummary } from "@/lib/api/types";

interface ProductCartButtonProps {
  product: ProductSummary;
  className?: string;
}

export function ProductCartButton({ product, className }: ProductCartButtonProps) {
  const router = useRouter();
  const buildPath = useSchoolPath();
  const { t } = useTranslation();
  const [added, setAdded] = useState(isProductInCart(product.id));
  const [error, setError] = useState<string | null>(null);

  const handleAddToCart = () => {
    setError(null);
    
    if (added) {
      router.push(buildPath("/checkout"));
      return;
    }

    const success = addProductToCart({
      product_id: product.id,
      product_title: product.title,
      product_price: product.price,
      product_cover: product.cover?.url,
    });

    if (success) {
      setAdded(true);
    } else {
      setError(t("products.alreadyInCart"));
    }
  };

  return (
    <div className={className}>
      <Button
        onClick={handleAddToCart}
        variant={added ? "primary" : "outline"}
        className="w-full"
      >
        {added ? (
          <>
            <Check className="h-4 w-4 mr-2" />
            {t("products.goToCart")}
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t("products.addToCart")}
          </>
        )}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

