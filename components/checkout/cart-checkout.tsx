"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, Loader2, AlertCircle, X, Trash2 } from "lucide-react";
import { formatCurrencyWithSchool } from "@/lib/utils";
import { useSchoolPath } from "@/components/providers/school-provider";
import { getCartItems, removeCourseFromCart, removeProductFromCart, syncCart, type CartItem } from "@/app/actions/cart";
import { validateVoucher } from "@/app/actions/voucher";
import { processCheckout } from "@/app/actions/checkout";
import { useTransition } from "react";
import type { CourseSummary } from "@/lib/api/types";

interface CartCheckoutProps {
  user: {
    id: number;
    email: string | null;
    phone_number: string | null;
    name: string;
    display_name?: string;
    currentProfile?: {
      id: number;
      schoolId: number;
      role: string;
      displayName: string;
    };
    currentSchool?: {
      id: number;
      name: string;
      slug: string;
      domain: string | null;
      currency: string;
      currency_symbol: string;
    } | null;
  };
  session: {
    userId: number;
    profileId: number;
    schoolId: number | null;
  };
}

export function CartCheckout({ user, session }: CartCheckoutProps) {
  const router = useRouter();
  const buildPath = useSchoolPath();
  const [pending, startTransition] = useTransition();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [validatingVoucher, setValidatingVoucher] = useState(false);
  const [discount, setDiscount] = useState<{
    discount_amount: number;
    final_amount: number;
  } | null>(null);

  useEffect(() => {
    const fetchCart = async () => {
      const items = getCartItems();
      setCart(items);
      setLoading(false);
      
      // Sync cart to server if authenticated (background)
      syncCart().catch(() => {
        // Silently fail
      });
    };
    
    fetchCart();
    
    // Listen for cart updates
    window.addEventListener("cartUpdated", fetchCart);
    
    return () => {
      window.removeEventListener("cartUpdated", fetchCart);
    };
  }, []);

  const handleRemoveItem = (item: CartItem) => {
    // Handle legacy items without item_type (assume COURSE if has course_id)
    const itemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
    if (itemType === 'PRODUCT' && item.product_id) {
      removeProductFromCart(item.product_id);
    } else if (item.course_id) {
      removeCourseFromCart(item.course_id);
    }
    setCart(getCartItems());
    setDiscount(null);
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim() || cart.length === 0) return;

    setVoucherError(null);
    setValidatingVoucher(true);

    const totalAmount = cart.reduce(
      (sum: number, item: CartItem) => {
        // Handle legacy items without item_type (assume COURSE if has course_id)
        const itemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
        const price = itemType === 'PRODUCT' 
          ? (item.product_price || 0) 
          : (item.course_price || 0);
        return sum + (price * 100);
      },
      0
    );

    try {
      const result = await validateVoucher({
        code: voucherCode.trim(),
        amount: totalAmount,
      });

      if (result.success && result.discount_amount !== undefined) {
        setDiscount({
          discount_amount: result.discount_amount,
          final_amount: result.final_amount ?? totalAmount - result.discount_amount,
        });
        setVoucherError(null);
      } else {
        setVoucherError(result.error || "Invalid voucher code");
        setDiscount(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to validate voucher code";
      setVoucherError(errorMessage);
      setDiscount(null);
    } finally {
      setValidatingVoucher(false);
    }
  };

  const handleCheckout = () => {
    if (!cart || cart.length === 0) {
      setError("Cart is empty");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        // Sync cart to server before checkout (ensure server has latest)
        await syncCart();
        
        const courseIds = cart.map((item: CartItem) => item.course_id);
        const result = await processCheckout({
          course_ids: courseIds,
          user_id: user.id,
          profile_id: session.profileId,
          voucher_code: discount ? voucherCode.trim() : undefined,
        });

        if (result.success) {
          if (result.bankRedirectUrl) {
            window.location.href = result.bankRedirectUrl;
            return;
          }
          router.push(buildPath("/account"));
          router.refresh();
        } else {
          setError(result.error || "Failed to complete checkout. Please try again.");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
      </div>
    );
  }

  if (!cart || cart.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 dark:text-slate-400">Your cart is empty</p>
        <Button
          onClick={() => router.push(buildPath("/courses"))}
          className="mt-4"
          variant="outline"
        >
          Browse Courses
        </Button>
      </div>
    );
  }

  const totalAmount = cart.reduce(
    (sum: number, item: CartItem) => {
      // Handle legacy items without item_type (assume COURSE if has course_id)
      const itemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
      const price = itemType === 'PRODUCT' 
        ? (item.product_price || 0) 
        : (item.course_price || 0);
      return sum + (price * 100);
    },
    0
  );
  const finalPrice = discount ? discount.final_amount / 100 : totalAmount / 100;
  const discountAmount = discount ? discount.discount_amount / 100 : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Cart Items ({cart.length})
        </h2>
        <div className="space-y-3">
          {cart.map((item: CartItem) => {
            // Handle legacy items without item_type (assume COURSE if has course_id)
            const itemType = item.item_type || (item.course_id ? 'COURSE' : 'PRODUCT');
            const itemId = itemType === 'PRODUCT' ? item.product_id : item.course_id;
            const itemTitle = itemType === 'PRODUCT' 
              ? (item.product_title || 'Unknown Product')
              : (item.course_title || 'Unknown Course');
            const itemPrice = itemType === 'PRODUCT' 
              ? (item.product_price || 0)
              : (item.course_price || 0);
            const itemTypeLabel = itemType === 'PRODUCT' ? 'Product' : 'Course';
            
            return (
              <div
                key={itemType === 'PRODUCT' ? `product_${item.product_id}` : `course_${item.course_id}`}
                className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900 dark:text-white">
                      {itemTitle}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      ({itemTypeLabel})
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {formatCurrencyWithSchool(itemPrice, user.currentSchool || null)}
                  </p>
                </div>
                <button
                  onClick={() => handleRemoveItem(item)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                  aria-label="Remove item"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <label className="text-sm font-medium text-slate-900 dark:text-white">
          Voucher Code
        </label>
        {discount ? (
          <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/70">
            <div className="flex-1">
              <div className="text-sm font-medium text-green-900 dark:text-green-100">
                {voucherCode.toUpperCase()}
              </div>
              <div className="text-xs text-green-700 dark:text-green-300">
                Discount: {formatCurrencyWithSchool(discountAmount, user.currentSchool || null)}
              </div>
            </div>
            <button
              onClick={() => {
                setVoucherCode("");
                setDiscount(null);
                setVoucherError(null);
              }}
              className="rounded-full p-1 text-green-700 hover:bg-green-100 dark:text-green-300 dark:hover:bg-green-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter voucher code"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                setVoucherError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleApplyVoucher();
                }
              }}
              className="flex-1"
            />
            <Button
              onClick={handleApplyVoucher}
              disabled={validatingVoucher || !voucherCode.trim()}
              loading={validatingVoucher}
            >
              Apply
            </Button>
          </div>
        )}
        {voucherError && (
          <p className="text-xs text-red-600 dark:text-red-400">{voucherError}</p>
        )}
      </div>

      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
          <span className="font-medium text-slate-900 dark:text-white">
            {formatCurrencyWithSchool(totalAmount / 100, user.currentSchool || null)}
          </span>
        </div>
        {discount && discountAmount > 0 && (
          <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
            <span>Discount</span>
            <span className="font-medium">
              -{formatCurrencyWithSchool(discountAmount, user.currentSchool || null)}
            </span>
          </div>
        )}
        <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-900 dark:text-white">Total</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrencyWithSchool(finalPrice, user.currentSchool || null)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/70 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <Button
        onClick={handleCheckout}
        className="w-full"
        size="lg"
        loading={pending}
        disabled={pending}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Complete Purchase - ${formatCurrencyWithSchool(finalPrice, user.currentSchool || null)}`
        )}
      </Button>
    </div>
  );
}

