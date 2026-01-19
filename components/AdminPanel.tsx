import React, { useState } from 'react';
import { ServiceItem, Customer, ProposalConfig } from '../types';
import { Edit2, Save, PlusCircle, Activity, Users, Box, Download, FileText, Trash2, FileSpreadsheet } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AdminPanelProps {
  services: ServiceItem[];
  setServices: React.Dispatch<React.SetStateAction<ServiceItem[]>>;
  customers: Customer[];
  proposalConfig: ProposalConfig;
  setProposalConfig: React.Dispatch<React.SetStateAction<ProposalConfig>>;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ services, setServices, customers, proposalConfig, setProposalConfig }) => {
  const [activeTab, setActiveTab] = useState<'services' | 'customers' | 'templates'>('services');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ServiceItem>>({});

  // Template Editing States
  const [tempTerms, setTempTerms] = useState<string>(proposalConfig.termsAndConditions.join('\n'));
  const [tempEmail, setTempEmail] = useState<string>(proposalConfig.contactEmail);
  const [tempHeader, setTempHeader] = useState<string>(proposalConfig.headerTitle);

  // CSV Export Logic
  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','), // Header row
      ...data.map(row => 
        headers.map(fieldName => {
          const value = row[fieldName] ?? '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }).join(',')
      )
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleExportServices = () => {
    const exportData = services.map(({ id, active, ...rest }) => ({
      ...rest,
      status: active ? 'Active' : 'Disabled'
    }));
    downloadCSV(exportData, `ForwardWorkx_Catalog_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportCustomers = () => {
    downloadCSV(customers, `ForwardWorkx_Clients_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Service Management Logic
  const startEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setEditForm({ ...service });
  };

  const saveEdit = () => {
    setServices(prev => prev.map(s => s.id === editingId ? { ...s, ...editForm } as ServiceItem : s));
    setEditingId(null);
    setEditForm({});
  };

  const toggleActive = (id: string) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleInputChange = (field: keyof ServiceItem, value: any) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const addNewService = () => {
    const newId = `new-${Date.now()}`;
    const newService: ServiceItem = {
      id: newId,
      category: 'New Category',
      subcategory: 'New Subcategory',
      name: 'New Service',
      unit: 'Unit',
      price: 0,
      deliverables: 'Description here',
      active: true,
    };
    setServices([...services, newService]);
    startEdit(newService);
  };

  const saveTemplateConfig = () => {
    setProposalConfig({
        headerTitle: tempHeader,
        contactEmail: tempEmail,
        termsAndConditions: tempTerms.split('\n').filter(line => line.trim() !== '')
    });
    alert('Template settings saved!');
  };

  // Prepare data for services chart
  const serviceChartData = Object.entries(services.reduce((acc, curr) => {
    const key = curr.subcategory.split(' - ').pop() || curr.subcategory;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, count]) => ({ name, count }));

  // Prepare data for customers chart
  const customerChartData = customers.map(c => ({
    name: c.companyName,
    downloads: c.proposalCount
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('services')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'services' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Box size={16} /> Services
          </button>
          <button 
            onClick={() => setActiveTab('customers')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'customers' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Users size={16} /> Customers
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'templates' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FileText size={16} /> Templates
          </button>
        </div>
      </div>

      {activeTab === 'services' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Catalog Management</h3>
            <div className="flex gap-3">
              <button onClick={handleExportServices} className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-all">
                <FileSpreadsheet size={18} /> Export Catalog (CSV)
              </button>
              <button onClick={addNewService} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium transition-all shadow-sm">
                <PlusCircle size={18} /> Add New Service
              </button>
            </div>
          </div>

          {/* Service Analytics */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} />
              Catalog Distribution
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={serviceChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-30} textAnchor="end" height={60} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Management Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Name & Subcategory</th>
                    <th className="p-4 font-semibold text-gray-600">Unit</th>
                    <th className="p-4 font-semibold text-gray-600">Price (One-time)</th>
                    <th className="p-4 font-semibold text-gray-600">Price (Monthly)</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        {editingId === service.id ? (
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              value={editForm.name} 
                              onChange={(e) => handleInputChange('name', e.target.value)}
                              className="w-full border p-1 rounded" 
                              placeholder="Name"
                            />
                            <input 
                              type="text" 
                              value={editForm.subcategory} 
                              onChange={(e) => handleInputChange('subcategory', e.target.value)}
                              className="w-full border p-1 rounded text-xs"
                              placeholder="Subcategory" 
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-medium text-gray-900">{service.name}</div>
                            <div className="text-xs text-gray-500">{service.subcategory}</div>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-gray-500 font-medium">
                        {editingId === service.id ? (
                            <input 
                              type="text" 
                              value={editForm.unit} 
                              onChange={(e) => handleInputChange('unit', e.target.value)}
                              className="w-full border p-1 rounded"
                            />
                        ) : service.unit}
                      </td>
                      <td className="p-4 font-bold text-gray-700">
                        {editingId === service.id ? (
                            <input 
                              type="number" 
                              value={editForm.price} 
                              onChange={(e) => handleInputChange('price', Number(e.target.value))}
                              className="w-full border p-1 rounded"
                            />
                        ) : `₹${service.price.toLocaleString()}`}
                      </td>
                      <td className="p-4 font-bold text-indigo-600">
                        {editingId === service.id ? (
                            <input 
                              type="number" 
                              value={editForm.monthlyPrice || 0} 
                              onChange={(e) => handleInputChange('monthlyPrice', Number(e.target.value))}
                              className="w-full border p-1 rounded"
                            />
                        ) : service.monthlyPrice ? `₹${service.monthlyPrice.toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => toggleActive(service.id)}
                          className={`px-2 py-1 rounded text-[10px] uppercase tracking-wider font-bold ${service.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {service.active ? 'Active' : 'Disabled'}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {editingId === service.id ? (
                          <button onClick={saveEdit} className="text-green-600 hover:text-green-800 transition-colors"><Save size={18} /></button>
                        ) : (
                          <button onClick={() => startEdit(service)} className="text-blue-600 hover:text-blue-800 transition-colors"><Edit2 size={18} /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'customers' && (
        <>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800">Client Management</h3>
            <button onClick={handleExportCustomers} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg hover:bg-emerald-100 text-sm font-medium transition-all">
              <FileSpreadsheet size={18} /> Export Client List (CSV)
            </button>
          </div>

          {/* Customer Analytics */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Activity size={16} />
              Lead Activity Overview
            </h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={customerChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} height={40} />
                  <YAxis allowDecimals={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} />
                  <Bar dataKey="downloads" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} name="Proposals Downloaded" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-4 font-semibold text-gray-600">Company / Brand</th>
                    <th className="p-4 font-semibold text-gray-600">Contact Person</th>
                    <th className="p-4 font-semibold text-gray-600">Contact Details</th>
                    <th className="p-4 font-semibold text-gray-600">Status</th>
                    <th className="p-4 font-semibold text-gray-600">Date Logged</th>
                    <th className="p-4 font-semibold text-gray-600 text-center">Downloads</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-500 italic">No customer records yet. Data will populate as clients download proposals.</td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 font-bold text-gray-900">{customer.companyName}</td>
                        <td className="p-4 font-medium text-gray-700">{customer.contactPerson}</td>
                        <td className="p-4">
                          <div className="text-[11px] font-medium text-indigo-600">{customer.email}</div>
                          <div className="text-[11px] text-gray-500">{customer.mobile}</div>
                        </td>
                        <td className="p-4">
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight">
                            {customer.businessCategory}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500 text-[10px]">{customer.joinedDate}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center gap-1 font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
                            <Download size={12} />
                            {customer.proposalCount}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'templates' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-3xl mx-auto animate-fade-in">
            <div className="mb-6 border-b pb-4">
                <h3 className="text-xl font-bold text-gray-800">Global Proposal Template</h3>
                <p className="text-gray-500 text-sm">Configure standard text blocks used in all generated PDF documents.</p>
            </div>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Proposal Document Title</label>
                    <input 
                        type="text" 
                        value={tempHeader}
                        onChange={(e) => setTempHeader(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-gray-800"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Primary Contact Email (for PDF)</label>
                    <input 
                        type="email" 
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Standard Terms & Conditions (One per line)</label>
                    <textarea 
                        rows={10}
                        value={tempTerms}
                        onChange={(e) => setTempTerms(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-xs leading-relaxed text-gray-600"
                        placeholder="1. Standard Payment Terms..."
                    />
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={saveTemplateConfig}
                        className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 flex items-center gap-2 shadow-lg transition-all active:scale-95"
                    >
                        <Save size={18} /> Save Template Settings
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;