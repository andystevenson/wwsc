import { env, Stripe, stripe, writeFileSync } from "./client";

/**
 * List all active products
 * @returns Stripe.Product[]
 */
export async function listActiveProducts() {
  const products = await stripe.products
    .list({ limit: 100, active: true })
    .autoPagingToArray({ limit: 10000 });
  return products;
}

/**
 * Format a product object into its useful parts
 * @param product
 * @returns FormattedProduct
 */
export type FormattedProduct = ReturnType<typeof formatProduct>;
export function formatProduct(product: Stripe.Product) {
  let { id, active, name, description, images, metadata } = product;
  return { id, active, name, description, images, metadata };
}

/**
 * Get all active products
 * @returns FormattedProduct[]
 */
export async function getActiveProducts() {
  let products = await listActiveProducts();
  let result = products.map((s) => formatProduct(s));
  writeFileSync(
    `${env.LOGPATH}/active-products.json`,
    JSON.stringify(products, null, 2),
  );
  writeFileSync(
    `${env.LOGPATH}/active-products-formatted.json`,
    JSON.stringify(result, null, 2),
  );
  return result;
}
