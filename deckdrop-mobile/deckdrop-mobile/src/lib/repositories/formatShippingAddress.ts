const addressFields = ['address', 'city', 'province', 'postalCode', 'country'] as const;

export const formatShippingAddress = (value: unknown): string => {
  let address = value;
  if (typeof address === 'string') {
    try {
      address = JSON.parse(address) as unknown;
    } catch {
      return typeof value === 'string' ? value : '';
    }
  }

  if (typeof address !== 'object' || address === null || Array.isArray(address)) {
    return typeof value === 'string' ? value : '';
  }

  const fields = address as Record<string, unknown>;
  const formatted = addressFields
    .map((field) => fields[field])
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim());

  return formatted.length > 0 ? formatted.join(', ') : '';
};