"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addCourseToCart, isInCart } from "@/app/actions/cart";
import { useRouter } from "next/navigation";
import { useSchoolPath } from "@/components/providers/school-provider";
import { useTranslation } from "@/lib/i18n/hooks";
import type { CourseSummary } from "@/lib/api/types";

interface CartButtonProps {
  course: CourseSummary;
  className?: string;
}

export function CartButton({ course, className }: CartButtonProps) {
  const router = useRouter();
  const buildPath = useSchoolPath();
  const { t } = useTranslation();
  // Initialize to false to match SSR (localStorage not available during SSR)
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check cart state after component mounts on client
  useEffect(() => {
    const checkCartState = () => {
      setAdded(isInCart(course.id));
    };
    
    // Check initial state
    checkCartState();
    
    // Listen for cart updates
    window.addEventListener("cartUpdated", checkCartState);
    
    return () => {
      window.removeEventListener("cartUpdated", checkCartState);
    };
  }, [course.id]);

  const handleAddToCart = () => {
    setError(null);
    
    if (added) {
      router.push(buildPath("/checkout"));
      return;
    }

    const success = addCourseToCart({
      course_id: course.id,
      course_title: course.title,
      course_price: course.price,
      course_cover: course.cover?.url,
    });

    if (success) {
      setAdded(true);
    } else {
      setError(t("courses.alreadyInCart"));
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
            {t("courses.goToCart")}
          </>
        ) : (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            {t("courses.addToCart")}
          </>
        )}
      </Button>
      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

