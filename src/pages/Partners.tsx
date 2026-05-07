import { useState } from 'react';
import { usePartnersStore } from '../stores/partnersStore';
import { useAuthStore } from '../stores/authStore';
import { CATEGORY_META, STATUS_META } from '../data/constants';
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';
import MapView from '../components/dashboard/MapView';
import PartnerForm from '../components/partners/PartnerForm';
import type { Partner } from '../types';

export default function Partners() {
  const user = useAuthStore((state) => state.user);
  const partners = usePartnersStore((state) => state.filteredPartners);
  const searchQuery = usePartnersStore((state) => state.searchQuery);
  const setSearchQuery = usePartnersStore((state) => state.setSearchQuery);
  const deletePartner = usePartnersStore((state) => state.deletePartner);
  const selectPartner = usePartnersStore((state) => state.selectPartner);
  const selectedPartner = usePartnersStore((state) => state.selectedPartner);

  const [showMap, setShowMap] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);

  const canEdit = user?.role === 'admin' || user?.role === 'manager';

  const handleDelete = (id: string) => {
    if (confirm('ต้องการลบพันธมิตรนี้หรือไม่?')) {
      deletePartner(id);
    }
  };

  const getStatusBadge = (partner: Partner) => {
    const status = partner.contract?.status || 'prospect';
    const meta = STATUS_META[status];
    return (
      <span
        className="px-2 py-1 text-xs rounded-full font-medium"
        style={{ backgroundColor: `${meta.color}20`, color: meta.color }}
      >
        {meta.label}
      </span>
    );
  };

  return (
    <MainLayout>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Partners Management</h1>
            <p className="text-gray-600 mt-1">{partners.length} partners</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                showMap
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>

            {canEdit && (
              <button
                onClick={() => setEditingPartner({ id: '' } as Partner)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus className="w-4 h-4" />
                Add Partner
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search partners..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Map View */}
        {showMap && (
          <div className="mb-6 h-96 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <MapView />
          </div>
        )}

        {/* Partners Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Partner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contract End
                  </th>
                  {canEdit && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {partners.map((partner) => {
                  const categoryMeta = CATEGORY_META[partner.category];
                  return (
                    <tr
                      key={partner.id}
                      onClick={() => selectPartner(partner)}
                      className={`hover:bg-gray-50 cursor-pointer transition ${
                        selectedPartner?.id === partner.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{partner.name_en}</div>
                          {partner.name_th && (
                            <div className="text-sm text-gray-500">{partner.name_th}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: `${categoryMeta.color}20`,
                            color: categoryMeta.color,
                          }}
                        >
                          <span>{categoryMeta.icon}</span>
                          <span>{categoryMeta.label}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {partner.zone.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(partner)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {partner.contract?.end_date || '-'}
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingPartner(partner);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(partner.id);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partner Details Sidebar */}
        {selectedPartner && (
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 p-6 overflow-y-auto z-50">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-bold text-gray-800">Partner Details</h2>
              <button
                onClick={() => selectPartner(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedPartner.name_en}</h3>
                {selectedPartner.name_th && (
                  <p className="text-gray-600">{selectedPartner.name_th}</p>
                )}
              </div>

              {selectedPartner.strategic_note && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-sm text-gray-700">💡 {selectedPartner.strategic_note}</p>
                </div>
              )}

              {selectedPartner.contract && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Contract Info</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">{selectedPartner.contract.type}</span>
                    </div>
                    {selectedPartner.contract.start_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start:</span>
                        <span className="font-medium">{selectedPartner.contract.start_date}</span>
                      </div>
                    )}
                    {selectedPartner.contract.end_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">End:</span>
                        <span className="font-medium">{selectedPartner.contract.end_date}</span>
                      </div>
                    )}
                    {selectedPartner.contract.renewal_owner && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Owner:</span>
                        <span className="font-medium">{selectedPartner.contract.renewal_owner}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Partner Form Modal */}
        {editingPartner && (
          <PartnerForm
            partner={editingPartner}
            onClose={() => setEditingPartner(null)}
          />
        )}
      </div>
    </MainLayout>
  );
}
