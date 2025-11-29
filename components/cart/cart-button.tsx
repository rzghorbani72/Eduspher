"use client";

import { useState } from "react";
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
  const [added, setAdded] = useState(isInCart(course.id));
  const [error, setError] = useState<string | null>(null);

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

