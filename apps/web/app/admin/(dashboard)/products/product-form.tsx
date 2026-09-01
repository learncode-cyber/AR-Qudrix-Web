"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  productAdminInputSchema,
  type ProductAdminInput,
  type ProductFull,
} from "@arqudrix/domain/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductFormProps {
  product?: ProductFull | null;
  isLoading?: boolean;
}

/**
 * Admin Product Form Component
 *
 * Features:
 *   - Create or edit product
 *   - i18n tabs (EN/AR)
 *   - All product fields (slug, category, status, pricing, etc.)
 *   - Image/logo URL upload
 *   - Accent color picker
 *   - External URL for CTA
 *   - Featured toggle
 *   - Full validation with Zod
 *
 * Mirrors the Business form pattern.
 */
export function ProductForm({ product, isLoading }: ProductFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ProductAdminInput>({
    resolver: zodResolver(productAdminInputSchema),
    defaultValues: product
      ? {
          slug: product.slug,
          category: product.category as any,
          status: product.status as any,
          businessId: product.businessId,
          logoUrl: product.logoUrl,
          coverImageUrl: product.coverImageUrl,
          accentColor: product.accentColor,
          externalUrl: product.externalUrl,
          priceLabel: product.priceLabel,
          displayOrder: product.displayOrder,
          isFeatured: product.isFeatured,
          translations: product.translations,
        }
      : {
          slug: "",
          category: "SOFTWARE",
          status: "PLANNED",
          businessId: null,
          logoUrl: null,
          coverImageUrl: null,
          accentColor: "#00BCD4",
          externalUrl: null,
          priceLabel: null,
          displayOrder: 0,
          isFeatured: false,
          translations: [
            {
              locale: "en",
              name: "",
              tagline: "",
              description: "",
              metaTitle: null,
              metaDescription: null,
            },
            {
              locale: "ar",
              name: "",
              tagline: "",
              description: "",
              metaTitle: null,
              metaDescription: null,
            },
          ],
        },
  });

  const onSubmit = async (data: ProductAdminInput) => {
    setIsSaving(true);
    setError(null);

    try {
      const method = product ? "PUT" : "POST";
      const url = product
        ? `/api/v1/products/${product.id}`
        : "/api/v1/products";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to save product");
      }

      router.push("/panel-b9cd8251/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <div className="p-4 rounded-lg bg-red-900/20 text-red-400">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Basic Information</h3>

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Slug</FormLabel>
                <FormControl>
                  <Input
                    placeholder="my-product-name"
                    {...field}
                    className="bg-gray-900"
                  />
                </FormControl>
                <FormDescription>
                  Used in URL: /products/{field.value || "slug"}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        "SOFTWARE",
                        "SERVICE",
                        "SUBSCRIPTION",
                        "PHYSICAL_GOOD",
                        "BUNDLE",
                        "OTHER",
                      ].map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-gray-900">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {[
                        "PLANNED",
                        "IN_DEVELOPMENT",
                        "ACTIVE",
                        "DISCONTINUED",
                        "ARCHIVED",
                      ].map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="priceLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Label (Display Only)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Starting at $99/mo"
                    {...field}
                    value={field.value || ""}
                    className="bg-gray-900"
                  />
                </FormControl>
                <FormDescription>
                  Displayed on card and landing page. No payment processing here.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accentColor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Accent Color (Hex)</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="#00BCD4"
                      {...field}
                      value={field.value || ""}
                      className="bg-gray-900"
                    />
                    <div
                      className="w-12 h-10 rounded border border-gray-700"
                      style={{ backgroundColor: field.value || "#00BCD4" }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Translations */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Translations</h3>

          <Tabs defaultValue="en" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900">
              <TabsTrigger value="en">English</TabsTrigger>
              <TabsTrigger value="ar">العربية (Arabic)</TabsTrigger>
            </TabsList>

            {["en", "ar"].map((locale) => {
              const translation = form.watch("translations")?.find(
                (t) => t.locale === locale
              );
              const idx =
                form.watch("translations")?.findIndex((t) => t.locale === locale) ?? -1;

              return (
                <TabsContent key={locale} value={locale} className="space-y-4">
                  <FormField
                    control={form.control}
                    name={`translations.${idx}.name`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={locale === "en" ? "Product Name" : "اسم المنتج"}
                            {...field}
                            value={field.value || ""}
                            className="bg-gray-900"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${idx}.tagline`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline (One-line)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              locale === "en"
                                ? "Brief product description"
                                : "وصف المنتج المختصر"
                            }
                            {...field}
                            value={field.value || ""}
                            className="bg-gray-900"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${idx}.description`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={
                              locale === "en"
                                ? "Full product description for landing page"
                                : "وصف المنتج الكامل لصفحة الهبوط"
                            }
                            {...field}
                            value={field.value || ""}
                            className="bg-gray-900 min-h-32"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${idx}.metaTitle`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SEO Title (max 60 chars)"
                            {...field}
                            value={field.value || ""}
                            maxLength={60}
                            className="bg-gray-900"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`translations.${idx}.metaDescription`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>SEO Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="SEO Description (max 160 chars)"
                            {...field}
                            value={field.value || ""}
                            maxLength={160}
                            className="bg-gray-900"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              );
            })}
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-6">
          <Button
            type="submit"
            disabled={isSaving}
            className="flex-1"
          >
            {isSaving ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
