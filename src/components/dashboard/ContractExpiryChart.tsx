'use client';

import { useEffect, useRef } from 'react';
import { usePartnersStore } from '@/stores/partnersStore';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function ContractExpiryChart() {
  const partners = usePartnersStore((state) => state.partners);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Count contracts by status
    const statusCounts = {
      active: 0,
      expiring_soon: 0,
      expired: 0,
      prospect: 0,
      negotiation: 0,
      renewed: 0,
      terminated: 0,
    };

    partners.forEach((partner) => {
      const status = partner.contract?.status;
      if (status && status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++;
      }
    });

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Active', 'Expiring Soon', 'Expired', 'Prospect', 'Negotiation', 'Renewed', 'Terminated'],
          datasets: [
            {
              data: [
                statusCounts.active,
                statusCounts.expiring_soon,
                statusCounts.expired,
                statusCounts.prospect,
                statusCounts.negotiation,
                statusCounts.renewed,
                statusCounts.terminated,
              ],
              backgroundColor: [
                '#10B981', // green - active
                '#F59E0B', // yellow - expiring
                '#EF4444', // red - expired
                '#3B82F6', // blue - prospect
                '#8B5CF6', // purple - negotiation
                '#06B6D4', // cyan - renewed
                '#6B7280', // gray - terminated
              ],
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                padding: 15,
                font: {
                  size: 12,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ${value} contracts`;
                },
              },
            },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [partners]);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Status Distribution</h3>
      <div style={{ height: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
