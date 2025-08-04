export interface PropertyFormData {
  title: string;
  description: string;
  type: string;
  operation: string;
  price: number | "";
  currency: string;
  bedrooms: number | "";
  bathrooms: number | "";
  area: number | "";
  address: string;
  neighborhood: string;
  features: string;
  featured: boolean;
  status: string;
  images: File[];
}

export interface PropertyFormProps {
  property?: any;
  mode: "create" | "edit";
}

export interface FormErrors {
  [key: string]: string;
}