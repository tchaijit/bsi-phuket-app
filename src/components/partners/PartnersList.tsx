'use client';

import { useState } from 'react';
import { usePartnersStore } from '@/stores/partnersStore';
import { useAuthStore } from '@/stores/authStore';
import PartnerForm from './PartnerForm';
import { CATEGORY_META, STATUS_META } from '@/data/constants';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import type { Partner, PartnerCategory, ContractStatus } from '@/types';

export default function PartnersList() {
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.role === 'admin' || user?.role === 'manager';
  const canDelete = user?.role === 'admin';

  const filteredPartners = usePartnersStore((state) => state.filteredPartners);
  const categoryFilters = usePartnersStore((state) => state.categoryFilters);
  const statusFilters = usePartnersStore((state) => state.statusFilters);
  const searchQuery = usePartnersStore((state) => state.searchQuery);
  const toggleCategoryFilter = usePartnersStore((state) => state.toggleCategoryFilter);
  const toggleStatusFilter = usePartnersStore((state) => state.toggleStatusFilter);
  const setSearchQuery = usePartnersStore((state) => state.setSearchQuery);
  const deletePartner = usePartnersStore((state) => state.deletePartner);

  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${name}"?`)) {
      try {
        await deletePartner(id);
      } catch (error) {
        alert('ไม่สามารถลบ partner ได้');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Partners</h1>
          <p className="text-gray-600">Manage all partnership relationships</p>
        </div>
        {canEdit && (
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Add Partner
          </button>
        )}
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Category Filters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(CATEGORY_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => toggleCategoryFilter(key as PartnerCategory)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition ${
                    categoryFilters.has(key as PartnerCategory)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filters */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(STATUS_META).map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => toggleStatusFilter(key as ContractStatus)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition ${
                    statusFilters.has(key as ContractStatus)
                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: meta.color }}
                  />
                  {meta.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    No partners found
                  </td>
                </tr>
              ) : (
                filteredPartners.map((partner) => {
                  const categoryMeta = CATEGORY_META[partner.category];
                  const statusMeta = partner.contract?.status
                    ? STATUS_META[partner.contract.status]
                    : null;

                  return (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {partner.name_en}
                          </div>
                          {partner.name_th && (
                            <div className="text-sm text-gray-500">{partner.name_th}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: categoryMeta.color }}
                        >
                          {categoryMeta.icon} {categoryMeta.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {partner.zone}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {partner.contract?.type || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {statusMeta ? (
                          <span
                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: statusMeta.color }}
                          >
                            {statusMeta.label}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      {canEdit && (
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingPartner(partner)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {canDelete && (
                              <button
                                onClick={() => handleDelete(partner.id, partner.name_en)}
                                className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredPartners.length}</span> partners
        </div>
      </div>

      {/* Partner Form Modal */}
      {(isCreating || editingPartner) && (
        <PartnerForm
          partner={editingPartner || ({} as Partner)}
          onClose={() => {
            setIsCreating(false);
            setEditingPartner(null);
          }}
        />
      )}
    </div>
  );
}
