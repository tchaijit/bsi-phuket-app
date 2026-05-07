'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePartnersStore } from '@/stores/partnersStore';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import ContractExpiryChart from '@/components/dashboard/ContractExpiryChart';
import ZoneDistribution from '@/components/dashboard/ZoneDistribution';
import { Building2, FileText, AlertCircle, TrendingUp } from 'lucide-react';

// Dynamic import for MapView to prevent SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/dashboard/MapView'), {
  ssr: false,
  loading: () => <div className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>,
});

export default function DashboardPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const partners = usePartnersStore((state) => state.partners);
  const fetchPartners = usePartnersStore((state) => state.fetchPartners);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    } else {
      fetchPartners();
    }
  }, [isAuthenticated, router, fetchPartners]);

  if (!isAuthenticated) {
    return null;
  }

  const activeContracts = partners.filter((p) => p.contract?.status === 'active').length;
  const expiringContracts = partners.filter((p) => p.contract?.status === 'expiring_soon').length;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Partners"
            value={partners.length}
            icon={Building2}
            trend="+12%"
            color="blue"
          />
          <StatsCard
            title="Active Contracts"
            value={activeContracts}
            icon={FileText}
            trend="+8%"
            color="green"
          />
          <StatsCard
            title="Expiring Soon"
            value={expiringContracts}
            icon={AlertCircle}
            trend="-3%"
            color="yellow"
          />
          <StatsCard
            title="Growth Rate"
            value="15.3%"
            icon={TrendingUp}
            trend="+2.1%"
            color="purple"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContractExpiryChart />
          <ZoneDistribution />
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Partner Locations</h2>
          <div className="h-[500px]">
            <MapView />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
