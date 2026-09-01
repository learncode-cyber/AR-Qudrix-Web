"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type ProductCard } from "@arqudrix/domain/schemas";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Edit2, Eye, Trash2, ExternalLink } from "lucide-react";

interface ProductTableProps {
  products: ProductCard[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

/**
 * Admin Product Table Component
 *
 * Displays products in a table format with:
 *   - Product name, category, status
 *   - Featured badge
 *   - Action buttons (view, edit, delete)
 *   - Pagination controls
 *
 * Mirrors the Business table pattern but for products.
 */
export function ProductTable({
  products,
  currentPage,
  totalPages,
  totalCount,
}: ProductTableProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/v1/products/${deleteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.refresh();
        setDeleteId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-700 bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-200">
                Name
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-200">
                Category
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-200">
                Status
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-200">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {products.map((product) => {
              const enTranslation =
                product.translations.find((t) => t.locale === "en") ||
                product.translations[0];

              return (
                <tr key={product.id} className="hover:bg-gray-900/50">
                  <td className="px-4 py-3 text-white">
                    <div>
                      <p className="font-medium">{enTranslation?.name}</p>
                      <p className="text-xs text-gray-400">
                        {product.slug}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    <Badge variant="outline">{product.slug.split("-")[0]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {product.isFeatured && (
                      <Badge className="mr-2 bg-amber-600">Featured</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Link href={`/panel-b9cd8251/products/${product.id}`}>
                      <Button size="sm" variant="ghost">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </Link>
                    <a
                      href={`/en/products/${product.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button size="sm" variant="ghost">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </a>
                    <button
                      onClick={() => setDeleteId(product.id)}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-gray-950 transition-colors hover:bg-red-900/20 hover:text-red-400 h-9 w-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-800">
          <p className="text-sm text-gray-400">
            Page {currentPage} of {totalPages} ({totalCount} total)
          </p>
          <div className="flex gap-2">
            {currentPage > 1 && (
              <Link href={`/panel-b9cd8251/products?page=${currentPage - 1}`}>
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {currentPage < totalPages && (
              <Link href={`/panel-b9cd8251/products?page=${currentPage + 1}`}>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the product. It won&apos;t be visible publicly.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
