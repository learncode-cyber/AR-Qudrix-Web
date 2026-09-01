/**
 * Product Catalog Domain — Public API
 *
 * Exports:
 *   - DTOs (schemas, types for API/client consumption)
 *   - Service functions (business logic)
 *
 * This is the boundary of the Product Catalog bounded context.
 * Server routes (app/api/v1/products) import from here.
 * Client components should NOT import from here directly; use the
 * @arqudrix/domain/schemas subpath export instead (see ../schemas.ts).
 */

export * from "./dto";
export * from "./service";
