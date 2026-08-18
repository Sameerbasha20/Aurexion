export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function truncateText(text: string, length = 60): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
