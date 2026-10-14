// The name an alert link puts in the URL (`/products?name=...`): the products
// list starts filtered by it. Read once, when the page mounts. A blank or missing
// name means no filter.
export function initialNameFilter(search: string): string | undefined {
  const name = new URLSearchParams(search).get('name')?.trim()
  return name ? name : undefined
}
