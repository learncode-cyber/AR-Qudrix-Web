"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { affiliateSignupSchema, type AffiliateSignup } from "@arqudrix/domain/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AffiliateSignupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const form = useForm<AffiliateSignup>({
    resolver: zodResolver(affiliateSignupSchema),
    defaultValues: {
      email: "",
      fullName: "",
      company: "",
      website: "",
      phone: "",
      bio: "",
      bankAccount: "",
      paymentMethod: null,
    },
  });

  const onSubmit = async (data: AffiliateSignup) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/affiliate/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to signup");
      }

      const result = await res.json();
      setReferralCode(result.referralCode);
      setSuccess(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success && referralCode) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-900/20 p-4">
          <h3 className="font-bold text-green-400">✅ Welcome to the Affiliate Program!</h3>
          <p className="mt-2 text-sm text-gray-300">
            Your affiliate account has been created. Your referral code is ready to use!
          </p>
        </div>

        <div className="rounded-lg bg-blue-900/20 p-4">
          <p className="text-xs text-gray-400 mb-2">Your Referral Code:</p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={referralCode}
              readOnly
              className="flex-1 rounded bg-gray-800 px-3 py-2 font-mono text-white"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(referralCode);
                alert("Copied to clipboard!");
              }}
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Copy
            </button>
          </div>
        </div>

        <div className="rounded-lg bg-gray-800/50 p-4">
          <p className="text-sm text-gray-300">
            <strong>Share this link:</strong>
          </p>
          <p className="mt-2 font-mono text-xs text-blue-400">
            https://arqudrix.com?ref={referralCode}
          </p>
        </div>

        <p className="text-sm text-gray-400">
          Check your email for your affiliate dashboard login details. You can start earning 10% commission immediately!
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-900/20 p-3 text-red-400">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name *</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} className="bg-gray-800" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address *</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  {...field}
                  className="bg-gray-800"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="+1 (555) 000-0000"
                  {...field}
                  value={field.value || ""}
                  className="bg-gray-800"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your company name"
                  {...field}
                  value={field.value || ""}
                  className="bg-gray-800"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website (Optional)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://yoursite.com"
                  {...field}
                  value={field.value || ""}
                  className="bg-gray-800"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About You (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about yourself and how you plan to promote..."
                  {...field}
                  value={field.value || ""}
                  className="bg-gray-800 min-h-20"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="border-t border-gray-700 pt-4">
          <h3 className="mb-4 font-semibold text-white">Payment Information</h3>

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferred Payment Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="PAYPAL">PayPal</SelectItem>
                    <SelectItem value="STRIPE">Stripe</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bankAccount"
            render={({ field }) => (
              <FormItem className="mt-4">
                <FormLabel>Bank Account / Payment Details (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="You can provide this later in your dashboard"
                    {...field}
                    value={field.value || ""}
                    className="bg-gray-800 min-h-16"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="rounded-lg bg-blue-900/20 p-3 text-sm text-blue-300">
          ℹ️ By signing up, you agree to earn 10% commission on all referrals made through your unique code.
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating Account..." : "Join Affiliate Program"}
        </Button>
      </form>
    </Form>
  );
}
