'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { usePartnersStore } from '@/stores/partnersStore';
import MainLayout from '@/components/layout/MainLayout';
import PartnersList from '@/components/partners/PartnersList';

export default function PartnersPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const checkAuth = useAuthStore((state) => state.checkAuth);
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

  return (
    <MainLayout>
      <PartnersList />
    </MainLayout>
  );
}
