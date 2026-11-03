export type LeadStatus =
  | 'New' | 'Researching' | 'Qualified' | 'ContactReady' | 'Contacted'
  | 'Responded' | 'Proposal' | 'Won' | 'Lost' | 'Disqualified' | 'Archived';

export interface Lead {
  id: string;
  businessName: string;
  category: string | null;
  description: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  source: string | null;
  sourceUrl: string | null;
  googlePlaceId?: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
}

export type LeadInput = Omit<Lead, 'id' | 'status' | 'createdAt' | 'updatedAt'>;
export interface PlaceCandidate { placeId: string; name: string | null; address: string | null; phone: string | null; website: string | null; category: string | null; }
export interface PagedResult<T> { items: T[]; page: number; pageSize: number; total: number; }
export interface Dashboard {
  totalLeads: number;
  newLeads: number;
  qualifiedLeads: number;
  contactedLeads: number;
  proposals: number;
  wonLeads: number;
  addedThisWeek: number;
  requiringAttention: number;
  funnel: Record<string, number>;
}

