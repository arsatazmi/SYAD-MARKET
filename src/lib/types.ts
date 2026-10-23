export type ActionState = {
  error?: string;
  success?: string;
};

export const initialActionState: ActionState = {};

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  priceLabel: string;
  kind: 'STANDARD' | 'SMM';
  unit: string;
  minQuantity: number;
  maxQuantity: number;
  requiresQuote: boolean;
  instructions: string | null;
  category: {
    name: string;
    slug: string;
  };
};
