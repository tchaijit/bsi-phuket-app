'use client';

import { useEffect, useRef } from 'react';
import { usePartnersStore } from '@/stores/partnersStore';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default function ZoneDistribution() {
  const partners = usePartnersStore((state) => state.partners);
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Count partners by zone
    const zoneCounts: Record<string, number> = {};
    partners.forEach((partner) => {
      const zone = partner.zone;
      zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
    });

    // Sort zones by count (descending)
    const sortedZones = Object.entries(zoneCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8); // Top 8 zones

    const labels = sortedZones.map(([zone]) => zone.replace(/_/g, ' '));
    const data = sortedZones.map(([, count]) => count);

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Partners',
              data,
              backgroundColor: '#3B82F6',
              borderColor: '#2563EB',
              borderWidth: 1,
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  return `${context.parsed.y} partners`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
              grid: {
                color: '#f3f4f6',
              },
            },
            x: {
              grid: {
                display: false,
              },
              ticks: {
                maxRotation: 45,
                minRotation: 45,
                font: {
                  size: 10,
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
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Partners by Zone</h3>
      <div style={{ height: '300px' }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
}
