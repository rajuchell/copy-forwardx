import React, { useState, useEffect } from 'react';
import { ShoppingCart, Settings, FileText, ArrowLeft, LayoutGrid, ArrowRight, Home, Palette, BarChart3, ShoppingBag, Bot, User, LogIn, LogOut, CheckCircle, Zap, ChevronDown, ChevronUp, Layers, Video, Monitor, Store, Share2, PenTool, Image as ImageIcon, Plus, X, Search, CheckCircle2, Target, Globe, MessageSquare, TrendingUp, Cpu, Rocket, Repeat } from 'lucide-react';
import { ServiceItem, CartItem, ClientInfo, AppState, Customer, ProposalConfig } from './types';
import { INITIAL_SERVICES, INITIAL_CLIENT_INFO, INITIAL_PROPOSAL_CONFIG } from './constants';
import ServiceCard from './components/ServiceCard';
import CartSidebar from './components/CartSidebar';
import AdminPanel from './components/AdminPanel';
import PDFGenerator from './components/PDFGenerator';
import AIAssistant from './components/AIAssistant';
import { generateExecutiveSummary } from './services/geminiService';

const Logo = () => (
  <svg width="240" height="40" viewBox="0 0 320 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 5L15 20L0 35H12L27 20L12 5H0Z" fill="#0f172a" />
    <path d="M15 5L30 20L15 35H27L42 20L27 5H15Z" fill="#3b82f6" />
    <path d="M30 5L45 20L30 35H42L57 20L42 5H30Z" fill="#93c5fd" />
    <text x="70" y="28" fontFamily="Inter, sans-serif" fontWeight="700" fontSize="24" fill="#0f172a">
      FORWARDWORKX
    </text>
  </svg>
);

const App: React.FC = () => {
  const [view, setView] = useState<AppState['view']>('catalog');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedOrganicSub, setExpandedOrganicSub] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [cart, setCart] = useState<CartItem[]>([]); 
  const [pendingCart, setPendingCart] = useState<CartItem[]>([]); 
  const [proposalConfig, setProposalConfig] = useState<ProposalConfig>(INITIAL_PROPOSAL_CONFIG);
  const [clientInfo, setClientInfo] = useState<ClientInfo>(INITIAL_CLIENT_INFO);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [recommendedIds, setRecommendedIds] = useState<string[]>([]);
  const [executiveSummary, setExecutiveSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('fw_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('fw_cart', JSON.stringify(cart));
  }, [cart]);

  const togglePendingItem = (service: ServiceItem) => {
    setPendingCart((prev) => {
      const exists = prev.find((item) => item.id === service.id);
      if (exists) {
        return prev.filter(item => item.id !== service.id);
      } else {
        return [...prev, { ...service, quantity: 1 }];
      }
    });
  };

  const updatePendingQuantity = (id: string, delta: number) => {
    setPendingCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(1, item.quantity + delta); 
          return { ...item, quantity: newQty };
        }
        return item;
      });
    });
  };

  const moveToCart = () => {
    setCart((prevCart) => {
      const newCart = [...prevCart];
      pendingCart.forEach(pendingItem => {
        const existingIndex = newCart.findIndex(item => item.id === pendingItem.id);
        if (existingIndex > -1) {
          newCart[existingIndex] = {
            ...newCart[existingIndex],
            quantity: newCart[existingIndex].quantity + pendingItem.quantity
          };
        } else {
          newCart.push(pendingItem);
        }
      });
      return newCart;
    });
    setPendingCart([]); 
    setIsCartOpen(true); 
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };
  
  const updateCartQuantity = (id: string, delta: number) => {
    setCart((prev) => {
        return prev.map((item) => {
          if (item.id === id) {
            const newQty = Math.max(0, item.quantity + delta); 
            return { ...item, quantity: newQty };
          }
          return item;
        }).filter(item => item.quantity > 0);
      });
  };

  const updateCartPrice = (id: string, newPrice: number) => {
    setCart((prev) => prev.map(item => item.id === id ? { ...item, price: newPrice } : item));
  };

  const handleApplyRecommendations = (ids: string[]) => {
    setRecommendedIds(ids);
  };

  const handleClientInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientInfo({ ...clientInfo, [e.target.name]: e.target.value });
  };

  const navigateHome = () => {
    setView('catalog');
    setActiveCategory(null);
    setSearchQuery('');
    setExpandedSection(null);
    setExpandedOrganicSub(null);
    window.scrollTo(0, 0);
  };

  const handleFinalizeAndDownload = () => {
    const timestamp = new Date();
    const existingCustomerIndex = customers.findIndex(c => c.email === clientInfo.email);
    let updatedCustomers = [...customers];
    if (existingCustomerIndex >= 0) {
      const existing = updatedCustomers[existingCustomerIndex];
      updatedCustomers[existingCustomerIndex] = {
        ...existing,
        companyName: clientInfo.companyName, 
        contactPerson: clientInfo.contactPerson,
        mobile: clientInfo.phone,
        proposalCount: existing.proposalCount + 1
      };
    } else {
      updatedCustomers.push({
        id: `cust-${Date.now()}`,
        companyName: clientInfo.companyName,
        contactPerson: clientInfo.contactPerson,
        email: clientInfo.email,
        mobile: clientInfo.phone,
        businessCategory: 'N/A', 
        proposalCount: 1,
        joinedDate: timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString()
      });
    }
    setCustomers(updatedCustomers);
    setShowSuccess(true);
    setTimeout(() => {
        setCart([]);
        setPendingCart([]);
        localStorage.removeItem('fw_cart');
        setShowSuccess(false);
        navigateHome();
    }, 1500); 
  };

  const handleProceed = () => {
    if (cart.length === 0) return;
    setView('preview');
  };

  useEffect(() => {
    if (view === 'preview' && cart.length > 0 && !executiveSummary) {
      setIsGeneratingSummary(true);
      generateExecutiveSummary(clientInfo.companyName, cart).then(summary => {
        setExecutiveSummary(summary);
        setIsGeneratingSummary(false);
      });
    }
  }, [view, cart, clientInfo.companyName]);

  const CONTENT_CREATIVE_SECTIONS = [
    { id: 'Website', label: 'Website', icon: Monitor, desc: 'Banners, Infographics, Web Assets' },
    { id: 'Marketplace', label: 'Marketplace', icon: Store, desc: 'EBC, Brand Store Creatives' },
    { id: 'Social Media', label: 'Social Media', icon: Share2, desc: 'Posts, Stories, Reels' },
    { id: 'Branding', label: 'Branding', icon: PenTool, desc: 'Brochures, Brand Books, Identity' },
    { id: 'Performance Creatives', label: 'Performance Ads', icon: Zap, desc: 'High-CTR Ad Copies & Videos' },
    { id: 'Short Video Formats', label: 'Short Videos', icon: Video, desc: 'Reels, YouTube Shorts' },
    { id: 'AI Production', label: 'AI Production', icon: Bot, desc: 'AI Videos, Lifestyle Images' },
  ];

  const MARKETING_SECTIONS = [
    { id: 'Organic Marketing', label: 'Organic Marketing', icon: Share2, desc: 'SMM, Search & Brand Media' },
    { id: 'Performance Marketing', label: 'Performance Marketing', icon: TrendingUp, desc: 'Paid Ads, Reach & ROI Focus' },
    { id: 'Enablement Marketing', label: 'Enablement Marketing', icon: Bot, desc: 'Tech Setup & CRM Integration' },
  ];

  const ECOMMERCE_SECTIONS = [
    { id: 'Rietail', label: 'Rietail', icon: Store, desc: 'Omnichannel & Modern Retail Excellence' },
    { id: 'Etailon', label: 'Etailon', icon: ShoppingBag, desc: 'Pureplay Marketplace & D2C Operations' },
    { id: 'Riaddon', label: 'Riaddon', icon: Layers, desc: 'Retail Tech Stack & Support Add-ons' },
  ];

  const TECHNOLOGY_SECTIONS = [
    { id: 'Tech Services', label: 'Technical & Agent Services', icon: User, desc: 'Expert Tech Consulting & Execution' },
    { id: 'Static Website Services', label: 'Standard Web Development', icon: Monitor, desc: 'Page-based Web Design & Build' },
    { id: 'Shopify Services', label: 'Shopify Integration', icon: ShoppingBag, desc: 'Storefront & Mobile Sync Solutions' },
    { id: 'Hosting & Deployment', label: 'Hosting & Infrastructure', icon: Globe, desc: 'Cloud Deployment & Yearly Support' },
  ];

  const ENABLEMENT_SECTIONS = [
    { id: 'Operations', label: 'Sales Operations', icon: Target, desc: 'CRM & Pipeline Optimization' },
    { id: 'Success', label: 'Customer Success', icon: CheckCircle2, desc: 'Retention & Support Excellence' },
    { id: 'Growth', label: 'Growth Enablement', icon: Rocket, desc: 'Tools & Workflows for Rapid Scaling' },
  ];

  const ORGANIC_SUB_CATEGORIES = [
    { id: 'Social Media Marketing', label: 'Social Media Marketing', goal: 'Follower Growth & Engagement', icon: MessageSquare },
    { id: 'Search Media', label: 'Search Media', goal: 'Keyword Improvement, Visibility & Search Performance', icon: Search },
    { id: 'Brand/Business Media', label: 'Brand/Business Media', goal: 'Reach & Performance', icon: Globe },
  ];

  const getFilteredServices = (sectionId: string, organicSubId?: string) => {
    return services.filter(s => {
       if (s.category !== activeCategory) return false;
       if (searchQuery.trim()) {
         const q = searchQuery.toLowerCase();
         const match = s.name.toLowerCase().includes(q) || 
                       s.subcategory.toLowerCase().includes(q) || 
                       (s.deliverables && s.deliverables.toLowerCase().includes(q));
         if (!match) return false;
       }
       const sub = s.subcategory;
       if (activeCategory === 'Content & Creative') {
          if (sectionId === 'Website') return sub.includes('Website');
          if (sectionId === 'Marketplace') return sub.includes('Marketplace');
          if (sectionId === 'Social Media') return sub.includes('Social Media');
          if (sectionId === 'Branding') return sub.includes('Branding');
          if (sectionId === 'Performance Creatives') return sub.includes('Performance Creatives');
          if (sectionId === 'Short Video Formats') return sub.includes('Short Video');
          if (sectionId === 'AI Production') return sub.includes('AI Production');
       }
       if (activeCategory === 'Marketing') {
          if (sectionId === 'Organic Marketing') {
            if (!sub.startsWith('Organic')) return false;
            if (organicSubId) return sub.toLowerCase().includes(organicSubId.toLowerCase());
            return true;
          }
          return sub === sectionId;
       }
       if (activeCategory === 'Ecommerce' || activeCategory === 'Technology' || activeCategory === 'Enablement') {
          return sub === sectionId;
       }
       return false;
    });
  };

  const getActiveCategorySections = () => {
    if (activeCategory === 'Content & Creative') return CONTENT_CREATIVE_SECTIONS;
    if (activeCategory === 'Marketing') return MARKETING_SECTIONS;
    if (activeCategory === 'Ecommerce') return ECOMMERCE_SECTIONS;
    if (activeCategory === 'Technology') return TECHNOLOGY_SECTIONS;
    if (activeCategory === 'Enablement') return ENABLEMENT_SECTIONS;
    return [];
  };

  const totalOneTime = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalMonthly = cart.reduce((acc, item) => acc + ((item.monthlyPrice || 0) * item.quantity), 0);
  const totalWithTax = totalOneTime * 1.18;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-24 relative">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={navigateHome}>
            <Logo />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={navigateHome} className={`flex items-center gap-2 text-sm font-medium transition-colors ${view === 'catalog' && !activeCategory ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>
               <Home size={18} /> <span className="hidden sm:inline">Home</span>
            </button>
            <button onClick={() => setView('admin')} className={`flex items-center gap-2 text-sm font-medium transition-colors ${view === 'admin' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>
               <Settings size={18} /> <span className="hidden sm:inline">Admin</span>
            </button>
            <button 
                onClick={() => setIsCartOpen(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold border transition-colors ${cart.length > 0 ? 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
            >
                <ShoppingBag size={18} />
                <span>Proposal Cart</span>
                <span className={`text-xs rounded-full w-5 h-5 flex items-center justify-center ml-1 ${cart.length > 0 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto min-h-[calc(100vh-80px)]">
        {view === 'catalog' && !activeCategory && (
          <div className="animate-fade-in">
             <div className="bg-indigo-900 text-white rounded-b-3xl mb-12 p-8 md:p-16 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-4xl mx-auto">
                   <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                     Transparent Pricing. <br/>
                     <span className="text-indigo-300">Instant Proposals.</span>
                   </h1>
                   <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
                     Explore our open service catalog, build your custom package, and download a professional proposal in seconds.
                   </p>
                   <div className="flex flex-wrap justify-center gap-4">
                    <button onClick={() => setActiveCategory('Marketing')} className="bg-white text-indigo-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-50 shadow-lg transition-transform hover:scale-105">Explore Marketing Plans</button>
                    <button onClick={() => setActiveCategory('Ecommerce')} className="bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-500 shadow-lg transition-transform hover:scale-105 border border-indigo-400">Ecommerce Solutions</button>
                   </div>
                </div>
                <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/2 translate-y-1/2"></div>
             </div>
             <div className="p-4 md:px-12 pb-20">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                 {[
                   { id: 'Marketing', icon: BarChart3, color: 'bg-blue-100 text-blue-600', desc: 'Organic, Performance & Enablement Marketing pillars.' },
                   { id: 'Content & Creative', icon: Palette, color: 'bg-purple-100 text-purple-600', desc: 'Brand identity, social media creatives, video production & AI content.' },
                   { id: 'Ecommerce', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600', desc: 'Rietail, Etailon, and Riaddon solutions for modern retail.' },
                   { id: 'Technology', icon: Cpu, color: 'bg-indigo-100 text-indigo-600', desc: 'Custom development, cloud infrastructure & data intelligence.' },
                   { id: 'Enablement', icon: Zap, color: 'bg-amber-100 text-amber-600', desc: 'Sales ops, customer success & growth acceleration tools.' },
                   { id: 'Automation', icon: Bot, color: 'bg-emerald-100 text-emerald-600', desc: 'Chatbots, workflow automation & CRM integration.' }
                 ].map((cat) => (
                   <div key={cat.id} onClick={() => setActiveCategory(cat.id)} className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-100 transition-all cursor-pointer flex flex-col items-start">
                     <div className={`p-4 rounded-xl mb-6 ${cat.color} group-hover:scale-110 transition-transform`}><cat.icon size={32} /></div>
                     <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{cat.id}</h2>
                     <p className="text-gray-500 mb-6 flex-1">{cat.desc}</p>
                     <div className="flex items-center text-indigo-600 font-bold group-hover:translate-x-2 transition-transform">View Categories <ArrowRight size={18} className="ml-2" /></div>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {view === 'catalog' && activeCategory && (
          <div className="p-4 md:p-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => { setActiveCategory(null); setSearchQuery(''); setExpandedSection(null); setExpandedOrganicSub(null); }} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500 hover:text-indigo-600"><ArrowLeft size={24} /></button>
                    <div><span className="text-sm text-gray-500 font-medium uppercase tracking-wider">Service Category</span><h1 className="text-3xl font-bold text-gray-900">{activeCategory}</h1></div>
                </div>
                <div className="relative w-full md:w-80">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                   <input type="text" placeholder="Search services..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white/80 backdrop-blur-sm shadow-sm" />
                </div>
            </div>
            <AIAssistant services={services} onApplyRecommendations={handleApplyRecommendations} />
            <div className="w-full space-y-4">
                {getActiveCategorySections().map((section) => {
                    const sectionServices = getFilteredServices(section.id);
                    const hasSearch = searchQuery.trim().length > 0;
                    const isExpanded = expandedSection === section.id || (hasSearch && sectionServices.length > 0);
                    if (hasSearch && sectionServices.length === 0) return null;
                    return (
                    <div key={section.id} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-100 shadow-md' : 'hover:shadow-md'}`}>
                        <div onClick={() => { if (!hasSearch) setExpandedSection(isExpanded ? null : section.id); }} className="p-6 cursor-pointer flex justify-between items-center bg-white">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-full ${isExpanded ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}><section.icon size={24} /></div>
                            <div><h3 className={`font-bold text-lg uppercase tracking-tight ${isExpanded ? 'text-indigo-900' : 'text-gray-900'}`}>{section.label}</h3><p className="text-sm text-gray-500">{section.desc}</p></div>
                        </div>
                        {!hasSearch && <div className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-500' : ''}`}><ChevronDown size={24} /></div>}
                        </div>
                        {isExpanded && <div className="p-6 pt-0 border-t border-gray-100 animate-fade-in bg-gray-50/50">
                            {section.id === 'Organic Marketing' && activeCategory === 'Marketing' ? (
                                <div className="space-y-4 py-4">
                                    {ORGANIC_SUB_CATEGORIES.map(sub => {
                                        const subServices = getFilteredServices(section.id, sub.id);
                                        const isSubExpanded = expandedOrganicSub === sub.id || (hasSearch && subServices.length > 0);
                                        return (
                                            <div key={sub.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                                                <div onClick={() => { if (!hasSearch) setExpandedOrganicSub(isSubExpanded ? null : sub.id); }} className={`p-4 cursor-pointer flex justify-between items-center ${isSubExpanded ? 'bg-indigo-50' : 'hover:bg-gray-50'}`}>
                                                    <div className="flex items-center gap-3"><sub.icon size={20} className={isSubExpanded ? 'text-indigo-600' : 'text-gray-500'} /><div><h4 className={`font-bold uppercase tracking-tighter ${isSubExpanded ? 'text-indigo-700' : 'text-gray-800'}`}>{sub.label}</h4><div className="flex items-center gap-2 text-[10px] text-gray-500 font-medium"><Target size={12} className="text-indigo-400" />{sub.goal}</div></div></div>
                                                    <div className={`transition-transform duration-300 ${isSubExpanded ? 'rotate-180 text-indigo-500' : 'text-gray-300'}`}><ChevronDown size={20} /></div>
                                                </div>
                                                {isSubExpanded && <div className="p-4 bg-gray-50/50 border-t border-gray-100"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{subServices.map(service => (<ServiceCard key={service.id} service={service} pendingQuantity={pendingCart.find(c => c.id === service.id)?.quantity || 0} savedQuantity={cart.find(c => c.id === service.id)?.quantity || 0} onToggle={togglePendingItem} onUpdatePendingQty={updatePendingQuantity} recommended={recommendedIds.includes(service.id)} />))}{subServices.length === 0 && (<p className="text-gray-400 italic text-sm py-4 col-span-full text-center">No services found in this sub-category yet.</p>)}</div></div>}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {sectionServices.map(service => (<ServiceCard key={service.id} service={service} pendingQuantity={pendingCart.find(c => c.id === service.id)?.quantity || 0} savedQuantity={cart.find(c => c.id === service.id)?.quantity || 0} onToggle={togglePendingItem} onUpdatePendingQty={updatePendingQuantity} recommended={recommendedIds.includes(service.id)} />))}
                                    {sectionServices.length === 0 && (<div className="col-span-full text-center py-12 px-4"><div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4"><Layers size={32} /></div><h4 className="text-gray-900 font-bold mb-1">Coming Soon</h4><p className="text-gray-500 text-sm max-w-xs mx-auto">Curating best {section.label} services.</p></div>)}
                                </div>
                            )}
                        </div>}
                    </div>
                    );
                })}
            </div>
          </div>
        )}

        {view === 'admin' && <AdminPanel services={services} setServices={setServices} customers={customers} proposalConfig={proposalConfig} setProposalConfig={setProposalConfig} />}

        {view === 'preview' && (
          <div className="p-8 max-w-4xl mx-auto">
             <button onClick={() => setView('catalog')} className="flex items-center gap-2 text-gray-500 mb-6 hover:text-indigo-600"><ArrowLeft size={20} /> Back to Catalog</button>
             <div className="bg-white rounded-xl shadow-lg border p-8">
               <div className="flex justify-between items-center mb-8 border-b pb-4"><h2 className="text-2xl font-bold">Generate Your Proposal</h2><FileText size={24} className="text-indigo-600" /></div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                   <h3 className="font-semibold text-lg text-gray-800 mb-2">Confirm Details</h3>
                   <input name="companyName" placeholder="Company Name *" value={clientInfo.companyName} onChange={handleClientInfoChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                   <input name="contactPerson" placeholder="Contact Person *" value={clientInfo.contactPerson} onChange={handleClientInfoChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                   <input name="email" placeholder="Email Address *" value={clientInfo.email} onChange={handleClientInfoChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required />
                   <input name="phone" placeholder="Phone Number" value={clientInfo.phone} onChange={handleClientInfoChange} className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                 </div>
                 <div className="bg-gray-50 p-6 rounded-xl border border-indigo-100">
                   <h3 className="font-semibold text-lg text-gray-800 mb-4">Pricing Summary</h3>
                   <div className="space-y-2 mb-4 text-sm text-gray-600 max-h-48 overflow-y-auto custom-scrollbar">
                      {cart.map(item => (
                        <div key={item.id} className="border-b border-gray-100 pb-2">
                           <div className="flex justify-between font-bold text-gray-800">
                              <span>{item.name} (x{item.quantity})</span>
                           </div>
                           <div className="flex justify-between text-xs mt-0.5">
                              {item.price > 0 && <span>One-time: ₹{(item.price * item.quantity).toLocaleString()}</span>}
                              {item.monthlyPrice && <span className="text-indigo-600 flex items-center gap-1 font-bold"><Repeat size={10} /> Monthly: ₹{(item.monthlyPrice * item.quantity).toLocaleString()}</span>}
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="space-y-2 border-t pt-4 mt-4">
                      <div className="flex justify-between font-bold text-indigo-900">
                        <span>One-time (Inc. 18% GST)</span>
                        <span>₹{totalWithTax.toLocaleString()}</span>
                      </div>
                      {totalMonthly > 0 && (
                        <div className="flex justify-between font-bold text-indigo-600 bg-indigo-50 p-2 rounded">
                          <span>Recurring Monthly Total</span>
                          <span>₹{totalMonthly.toLocaleString()}</span>
                        </div>
                      )}
                   </div>
                   {isGeneratingSummary && <p className="text-xs text-indigo-500 mt-4 animate-pulse">AI is personalizing your proposal...</p>}
                   <div className="mt-8"><PDFGenerator cart={cart} clientInfo={clientInfo} executiveSummary={executiveSummary} config={proposalConfig} onDownload={handleFinalizeAndDownload} /></div>
                 </div>
               </div>
             </div>
          </div>
        )}
      </main>
      {pendingCart.length > 0 && (
         <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl bg-gray-900 text-white rounded-2xl shadow-2xl p-4 z-50 animate-bounce-in flex items-center justify-between border border-gray-700">
             <div className="flex items-center gap-4">
                <div className="bg-indigo-600 rounded-full w-10 h-10 flex items-center justify-center font-bold">{pendingCart.length}</div>
                <div>
                    <div className="text-xs text-gray-400">Items to Add</div>
                    <div className="font-bold text-lg">₹{(pendingCart.reduce((a,b) => a + (b.price * b.quantity), 0)).toLocaleString()} {pendingCart.some(i => i.monthlyPrice) && "+ Monthly"}</div>
                </div>
             </div>
             <div className="flex gap-2">
                 <button onClick={() => setPendingCart([])} className="p-3 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
                 <button onClick={moveToCart} className="bg-white text-gray-900 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"><Plus size={18} /> Add to Proposal</button>
             </div>
         </div>
      )}
      <CartSidebar cart={cart} onUpdateQty={updateCartQuantity} onUpdatePrice={updateCartPrice} onRemove={removeFromCart} isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onProceed={handleProceed} />
    </div>
  );
};

export default App;