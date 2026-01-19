export interface ServiceItem {
  id: string;
  category: string;
  subcategory: string;
  name: string;
  unit: string;
  price: number;
  monthlyPrice?: number; // Added for recurring subscription support
  priceRange?: string; 
  deliverables: string;
  description?: string;
  active: boolean;
}

export interface CartItem extends ServiceItem {
  quantity: number;
}

export interface ClientInfo {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  date: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  businessCategory: string;
  proposalCount: number;
  joinedDate: string;
}

export interface ProposalConfig {
  termsAndConditions: string[];
  contactEmail: string;
  headerTitle: string;
}

export interface AppState {
  view: 'catalog' | 'admin' | 'preview' | 'signup';
  activeCategory: string | null;
  currentUser: Customer | null;
  customers: Customer[];
  cart: CartItem[];
  clientInfo: ClientInfo;
  services: ServiceItem[];
  proposalConfig: ProposalConfig;
}

export enum ProposalStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED',
}