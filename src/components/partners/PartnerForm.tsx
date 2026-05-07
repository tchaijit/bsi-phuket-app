'use client';

import { useState, useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { usePartnersStore } from '../../stores/partnersStore';
import { CATEGORY_META, STATUS_META } from '../../data/constants';
import { ZONE_LIST } from '../../data/zones';
import MapLocationPicker from '../map/MapLocationPicker';
import type { Partner, PartnerCategory, ContractStatus, ZoneName } from '../../types';

interface PartnerFormProps {
  partner: Partner | null;
  onClose: () => void;
}

export default function PartnerForm({ partner, onClose }: PartnerFormProps) {
  const addPartner = usePartnersStore((state) => state.addPartner);
  const updatePartner = usePartnersStore((state) => state.updatePartner);

  const isEditing = partner && partner.id;
  const [showMapPicker, setShowMapPicker] = useState(false);

  const [formData, setFormData] = useState({
    name_en: '',
    name_th: '',
    category: 'hospital' as PartnerCategory,
    zone: 'west_coast_kamala_patong' as ZoneName,
    lat: 7.8884,
    lng: 98.3826,
    strategic_note: '',
    contract_type: '',
    contract_status: 'prospect' as ContractStatus,
    contract_start_date: '',
    contract_end_date: '',
    contract_renewal_owner: '',
    contract_value: '',
  });

  useEffect(() => {
    if (partner && partner.id) {
      setFormData({
        name_en: partner.name_en || '',
        name_th: partner.name_th || '',
        category: partner.category,
        zone: partner.zone,
        lat: partner.lat,
        lng: partner.lng,
        strategic_note: partner.strategic_note || '',
        contract_type: partner.contract?.type || '',
        contract_status: partner.contract?.status || 'prospect',
        contract_start_date: partner.contract?.start_date || '',
        contract_end_date: partner.contract?.end_date || '',
        contract_renewal_owner: partner.contract?.renewal_owner || '',
        contract_value: partner.contract?.value?.toString() || '',
      });
    }
  }, [partner]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, lat, lng }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const partnerData: Partner = {
      id: isEditing ? partner.id : `partner-${Date.now()}`,
      name_en: formData.name_en,
      name_th: formData.name_th || undefined,
      category: formData.category,
      zone: formData.zone,
      lat: parseFloat(formData.lat.toString()),
      lng: parseFloat(formData.lng.toString()),
      strategic_note: formData.strategic_note || undefined,
    };

    // Add contract if any contract fields are filled
    if (
      formData.contract_type ||
      formData.contract_start_date ||
      formData.contract_end_date ||
      formData.contract_renewal_owner ||
      formData.contract_value
    ) {
      partnerData.contract = {
        type: formData.contract_type || 'standard',
        status: formData.contract_status,
        start_date: formData.contract_start_date || undefined,
        end_date: formData.contract_end_date || undefined,
        renewal_owner: formData.contract_renewal_owner || undefined,
        value: formData.contract_value ? parseFloat(formData.contract_value) : undefined,
      };
    }

    if (isEditing) {
      updatePartner(partnerData);
    } else {
      addPartner(partnerData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10001] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {isEditing ? 'Edit Partner' : 'Add New Partner'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  English Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Bangkok Hospital Siriroj"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thai Name
                </label>
                <input
                  type="text"
                  name="name_th"
                  value={formData.name_th}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="โรงพยาบาลกรุงเทพศิริโรจน์"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {Object.entries(CATEGORY_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.icon} {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone <span className="text-red-500">*</span>
                </label>
                <select
                  name="zone"
                  value={formData.zone}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {ZONE_LIST.map((zone) => (
                    <option key={zone.name} value={zone.name}>
                      {zone.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Location</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    name="lat"
                    value={formData.lat}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="7.8884"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    name="lng"
                    value={formData.lng}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="98.3826"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-2 border-blue-200 rounded-lg hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition flex items-center justify-center gap-2 font-medium"
              >
                <MapPin className="w-5 h-5" />
                Pick Location from Map (Click to Auto-Fill Coordinates)
              </button>
            </div>
          </div>

          {/* Contract Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Contract Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Type
                </label>
                <input
                  type="text"
                  name="contract_type"
                  value={formData.contract_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. MOU, Partnership, Vendor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Status
                </label>
                <select
                  name="contract_status"
                  value={formData.contract_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {Object.entries(STATUS_META).map(([key, meta]) => (
                    <option key={key} value={key}>
                      {meta.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="contract_start_date"
                  value={formData.contract_start_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  name="contract_end_date"
                  value={formData.contract_end_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Owner
                </label>
                <input
                  type="text"
                  name="contract_renewal_owner"
                  value={formData.contract_renewal_owner}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contract Value (THB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  name="contract_value"
                  value={formData.contract_value}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="1000000"
                />
              </div>
            </div>
          </div>

          {/* Strategic Note */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Strategic Note
              </label>
              <textarea
                name="strategic_note"
                value={formData.strategic_note}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Any strategic notes or important information..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {isEditing ? 'Update Partner' : 'Add Partner'}
            </button>
          </div>
        </form>
      </div>

      {/* Map Location Picker */}
      {showMapPicker && (
        <MapLocationPicker
          initialLat={formData.lat}
          initialLng={formData.lng}
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </div>
  );
}
