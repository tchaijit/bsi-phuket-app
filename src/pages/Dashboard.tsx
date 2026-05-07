import { useEffect, useState } from 'react';
import { usePartnersStore } from '../stores/partnersStore';
import { calculateKPIs, computeZoneScores, findWhitespace } from '../utils/analytics';
import { exportToPDF, exportToExcel } from '../utils/export';
import { Download, FileText, TrendingUp, Users, AlertCircle, Target } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

export default function Dashboard() {
  const partners = usePartnersStore((state) => state.partners);
  const [kpis, setKpis] = useState<any>(null);
  const [zoneScores, setZoneScores] = useState<any>(null);
  const [whitespace, setWhitespace] = useState<any[]>([]);

  useEffect(() => {
    const calculatedKPIs = calculateKPIs(partners);
    const scores = computeZoneScores(partners);
    const ws = findWhitespace(partners);

    setKpis(calculatedKPIs);
    setZoneScores(scores);
    setWhitespace(ws);
  }, [partners]);

  const handleExportPDF = () => {
    if (zoneScores && kpis) {
      exportToPDF(partners, zoneScores, kpis);
    }
  };

  const handleExportExcel = () => {
    exportToExcel(partners, zoneScores);
  };

  if (!kpis) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600 mt-1">BSI Phuket Competitive Analysis</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <FileText className="w-4 h-4" />
              Export Excel
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            icon={<Users className="w-6 h-6" />}
            label="Total Partners"
            value={kpis.totalPartners}
            color="blue"
          />
          <KPICard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Active Rate"
            value={`${kpis.activeRate}%`}
            color={kpis.activeRate >= 80 ? 'green' : kpis.activeRate >= 60 ? 'yellow' : 'red'}
          />
          <KPICard
            icon={<Target className="w-6 h-6" />}
            label="Avg Zone Score"
            value={kpis.zasAverage}
            color={kpis.zasAverage >= 60 ? 'green' : kpis.zasAverage >= 40 ? 'yellow' : 'red'}
          />
          <KPICard
            icon={<AlertCircle className="w-6 h-6" />}
            label="Expiring ≤90d"
            value={kpis.expiringCount}
            color={kpis.expiringCount === 0 ? 'green' : kpis.expiringCount <= 3 ? 'yellow' : 'red'}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Zone Scores */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Zone Advantage Scores</h2>
            <div className="space-y-3">
              {Object.values(zoneScores || {}).map((score: any) => (
                <div key={score.zone} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{score.zone}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          score.zas >= 60 ? 'bg-green-500' : score.zas >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${score.zas}%` }}
                      />
                    </div>
                    <span className="font-bold text-gray-800 w-12 text-right">
                      {Math.round(score.zas)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Whitespace Opportunities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Whitespace Opportunities</h2>
            <div className="space-y-3">
              {whitespace.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No critical whitespace detected ✓</p>
              ) : (
                whitespace.map((ws, idx) => (
                  <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {ws.category} — {ws.zoneLabel}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {ws.compCount} competitor presence • 0 BSI partners
                        </p>
                      </div>
                      <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Priority: {Math.round(ws.priority)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Executive Summary</h2>
          <div className="prose max-w-none">
            <p className="text-gray-700">
              <strong>Position:</strong> Average Zone Advantage Score is <strong>{kpis.zasAverage}</strong>.
              Total active partners: <strong>{kpis.activePartners}</strong> out of{' '}
              <strong>{kpis.totalPartners}</strong> ({kpis.activeRate}%).
            </p>
            {kpis.expiringCount > 0 && (
              <p className="text-gray-700 mt-3">
                <strong>Risk:</strong> {kpis.expiringCount} contract{kpis.expiringCount > 1 ? 's' : ''}{' '}
                expiring in the next 90 days. Renewal pipeline needs immediate review.
              </p>
            )}
            {whitespace.length > 0 && (
              <p className="text-gray-700 mt-3">
                <strong>Opportunity:</strong> {whitespace.length} whitespace{' '}
                {whitespace.length > 1 ? 'opportunities' : 'opportunity'} detected where competitors
                are present but BSI has no partners.
              </p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function KPICard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-600 mt-1">{label}</p>
      </div>
    </div>
  );
}
