// User and Authentication Types
export type UserRole = 'admin' | 'manager' | 'viewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatar?: string;
}

// Partner Categories
export type PartnerCategory =
  | 'hospital'
  | 'clinic'
  | 'hotel'
  | 'tour_operator'
  | 'insurance'
  | 'transport'
  | 'pharmacy'
  | 'other';

// Contract Status
export type ContractStatus =
  | 'prospect'
  | 'negotiation'
  | 'active'
  | 'expiring_soon'
  | 'expired'
  | 'renewed'
  | 'terminated';

// Zone Names
export type ZoneName =
  | 'west_coast_kamala_patong'
  | 'north_bangtao_surin_layan'
  | 'west_coast_karon_kata'
  | 'phuket_town_central'
  | 'south_rawai_naiharn'
  | 'north_mai_khao_nai_yang'
  | 'east_coast_panwa_chalong_pier'
  | 'north_thalang_inland';

// Contract Interface
export interface Contract {
  status: ContractStatus;
  type: string;
  start_date?: string;
  end_date?: string;
  renewal_owner?: string;
  value?: number;
  last_reviewed?: string;
}

// Partner Details Interfaces
export interface HotelDetails {
  rooms?: number;
  star_rating?: number;
  guest_nationality_top3?: string[];
  medical_concierge?: boolean;
  ambulance_priority?: string;
  annual_referrals_estimate?: number;
}

export interface InsuranceDetails {
  company_short?: string;
  coverage?: string[];
  direct_billing?: boolean;
  claim_turnaround_days?: number;
  patient_volume_yr?: number;
}

export interface ClinicDetails {
  specialty?: string[];
  doctor_lead?: string;
  referral_volume_yr?: number;
  exclusive_to_bsi?: boolean;
}

export interface CorporateDetails {
  industry?: string;
  employees?: number;
  package_tier?: string;
  annual_checkup_volume?: number;
}

export interface MallDetails {
  operator?: string;
  gross_floor_area_sqm?: number;
  anchor_tenants?: string[];
  footfall_daily_avg?: number;
  tourist_share_pct?: number;
  demographic_lean?: string;
  health_kiosk_space_available?: boolean;
  competitor_kiosks_present?: string[];
}

export interface SchoolDetails {
  type?: string;
  curriculum?: string;
  students_total?: number;
  students_thai_pct?: number;
  annual_tuition_thb_avg?: number;
  school_nurse_onsite?: boolean;
  current_health_provider?: string;
  annual_checkup_required?: boolean;
  vaccination_program?: boolean;
  parent_socioeconomic_tier?: string;
  decision_maker?: string;
}

export interface CompetitorDetails {
  operator?: string;
  beds?: number;
  jci_accredited?: boolean;
  threat_level?: 'low' | 'medium' | 'high';
}

export interface BDMSDetails {
  code?: string;
  beds?: number;
  role_in_cluster?: string;
  primary_catchment_km?: number;
}

// Partner Interface
export interface Partner {
  id: string;
  name_en: string;
  name_th?: string;
  category: PartnerCategory;
  lat: number;
  lng: number;
  address?: string;
  zone: ZoneName;
  contract?: Contract;
  hotel_details?: HotelDetails;
  insurance_details?: InsuranceDetails;
  clinic_details?: ClinicDetails;
  corporate_details?: CorporateDetails;
  mall_details?: MallDetails;
  school_details?: SchoolDetails;
  competitor_details?: CompetitorDetails;
  bdms_details?: BDMSDetails;
  strategic_note?: string;
}

// Zone Interface
export interface Zone {
  name: ZoneName;
  label: string;
  target: number;
  density: 'low' | 'medium' | 'high' | 'very_high';
  weight: number;
}

// Zone Score Interface
export interface ZoneScore {
  zone: ZoneName;
  coverage: number;
  health: number;
  pressureInv: number;
  diversity: number;
  cluster: number;
  zas: number;
  bsiCount: number;
  activeCount: number;
  competitorCount: number;
}

// Whitespace Opportunity Interface
export interface WhitespaceOpportunity {
  zone: ZoneName;
  zoneLabel: string;
  category: PartnerCategory;
  bsiCount: number;
  compCount: number;
  priority: number;
}

// Notification Interface
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

// Dashboard KPI Interface
export interface DashboardKPI {
  label: string;
  value: string | number;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

// Export Options
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'ppt';
  includeCharts?: boolean;
  includeMap?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
