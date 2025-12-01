
import React, { useState, useEffect, useRef } from 'react';
import {
   Calculator, DollarSign, Package, ShoppingBag, TrendingUp,
   Save, Trash2, Search, Barcode, History, Battery, Smartphone,
   Tag, Palette, HardDrive, Sparkles, MessageSquare, Brain, FileText,
   Calendar, AlertTriangle, Clock, MapPin, ExternalLink, ClipboardCheck,
   ThumbsUp, Printer, Download, Pencil, FileJson, Upload, XCircle, RefreshCw, Eye, X,
   Moon, Sun, Wifi, WifiOff, LayoutDashboard, ListChecks, Users, ShieldCheck, Copy, Plus,
   CreditCard, Settings, LogOut, CheckCircle, ArrowRight, Truck, ShoppingCart, Lock, UserPlus, UserCog, KeyRound, CheckSquare, Square
} from 'lucide-react';
import { InventoryItem, CalculatorSettings, MarketPriceData, PrintMode, IPHONE_MODELS, APPLE_COLORS, ViewMode, Supplier, ShoppingItem, SecurityCheckResult, PaymentRate, Customer, Sale, User, SaleItem, SalePayment, UserPermissions, UserRole } from './types';
import { GeminiService } from './services/geminiService';
import PrintLayout from './components/PrintLayout';
import { roundUpToFive, formatCurrency, calculateWarrantyEnd, getDaysRemaining, getTodayString } from './utils/helpers';
import AuthScreen from './components/screens/AuthScreen';
import SalesScreen from './components/screens/SalesScreen';
import { DEFAULT_ADMIN_PERMISSIONS, DEFAULT_MANAGER_PERMISSIONS, DEFAULT_SELLER_PERMISSIONS } from './utils/constants';

// --- CONSTANTS ---
// Moved to utils/constants.ts

// --- AUTH COMPONENT (V4.0 - Email/Pass + Setup) ---
// Moved to components/screens/AuthScreen.tsx

const DEFAULT_RATES: PaymentRate[] = Array.from({ length: 18 }, (_, i) => ({
   installments: i + 1,
   costPercent: (i + 1) * 1.5,
   passPercent: (i + 1) * 1.8
}));

const App = () => {
   // --- AUTH STATE ---
   const [currentUser, setCurrentUser] = useState<User | null>(null);
   const [users, setUsers] = useState<User[]>([]);

   // --- APP STATES ---
   const [view, setView] = useState<ViewMode>('sales'); // Default to sales
   const [settings, setSettings] = useState<CalculatorSettings>({
      dollarPrice: '', exchangeRate: '', freightPercent: '', retailMarkup: '', wholesaleMarkup: ''
   });

   const [form, setForm] = useState({
      model: '', capacity: '', color: '', condition: 'Novo', imei: '', battery: '', supplier: '',
      purchaseDate: getTodayString(), manualRetailPrice: '', manualWholesalePrice: ''
   });

   const [inventory, setInventory] = useState<InventoryItem[]>([]);
   const [suppliers, setSuppliers] = useState<Supplier[]>([]);
   const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
   const [customers, setCustomers] = useState<Customer[]>([]);
   const [sales, setSales] = useState<Sale[]>([]);

   // Financial Calculator States
   const [paymentRates, setPaymentRates] = useState<PaymentRate[]>(DEFAULT_RATES);
   const [calcMode, setCalcMode] = useState<'pricing' | 'simulation'>('pricing');
   const [calcValue, setCalcValue] = useState<string>('');
   const [showRateModal, setShowRateModal] = useState(false);

   // Edit/View States
   const [editingId, setEditingId] = useState<number | null>(null);

   // Sales Module States (V4.0 Cart System)
   // cart, cartCustomer, cartPayments moved to SalesScreen
   const [currentSalePrint, setCurrentSalePrint] = useState<{ sale: Sale, customer: Customer } | null>(null);

   // Management States
   const [newCustomer, setNewCustomer] = useState<Customer>({ id: '', name: '', cpf: '', phone: '', address: '', createdAt: '' });
   const [newSupplier, setNewSupplier] = useState<Supplier>({ id: '', name: '', contact: '', pixKey: '', notes: '' });
   const [newShoppingItem, setNewShoppingItem] = useState({ desc: '', price: '' });

   // Team States
   const [newUser, setNewUser] = useState<{ name: string, email: string, password: string, role: UserRole }>({ name: '', email: '', password: '', role: 'seller' });
   const [newPermissions, setNewPermissions] = useState<UserPermissions>(DEFAULT_SELLER_PERMISSIONS);

   // AI & Security
   const [isProcessing, setIsProcessing] = useState(false);
   const [securityResult, setSecurityResult] = useState<SecurityCheckResult | null>(null);

   // Print State
   const [printMode, setPrintMode] = useState<PrintMode>('none');

   // System State
   const [isOnline, setIsOnline] = useState(navigator.onLine);
   const [darkMode, setDarkMode] = useState(() => {
      if (typeof window !== 'undefined') {
         const saved = localStorage.getItem('outletStoreDarkMode');
         return saved ? JSON.parse(saved) : false;
      }
      return false;
   });

   // --- DATA PERSISTENCE ---
   useEffect(() => {
      if (!currentUser) return;
      localStorage.setItem('outletStoreInventory', JSON.stringify(inventory));
      localStorage.setItem('outletStoreSettings', JSON.stringify(settings));
      localStorage.setItem('outletStoreSuppliers', JSON.stringify(suppliers));
      localStorage.setItem('outletStoreShopping', JSON.stringify(shoppingList));
      localStorage.setItem('outletStoreRates', JSON.stringify(paymentRates));
      localStorage.setItem('outletStoreCustomers', JSON.stringify(customers));
      localStorage.setItem('outletStoreSales', JSON.stringify(sales));
      localStorage.setItem('outletStoreUsers', JSON.stringify(users));
   }, [inventory, settings, suppliers, shoppingList, paymentRates, customers, sales, users, currentUser]);

   // Initial Load (Before Login)
   useEffect(() => {
      const savedUsers = localStorage.getItem('outletStoreUsers');
      if (savedUsers) setUsers(JSON.parse(savedUsers));
      // Load other data only after login to keep memory clean, but load users first to check if setup is needed
   }, []);

   const handleLogin = (user: User) => {
      // BACKWARD COMPATIBILITY: If user has no permissions (old version), assign based on role
      if (!user.permissions) {
         if (user.role === 'admin') user.permissions = DEFAULT_ADMIN_PERMISSIONS;
         else user.permissions = DEFAULT_SELLER_PERMISSIONS;
      }

      setCurrentUser(user);
      if (users.length === 0) setUsers([user]); // First Admin

      // Load Data
      const savedInv = localStorage.getItem('outletStoreInventory');
      if (savedInv) setInventory(JSON.parse(savedInv));
      const savedSettings = localStorage.getItem('outletStoreSettings');
      if (savedSettings) setSettings(JSON.parse(savedSettings));
      const savedSuppliers = localStorage.getItem('outletStoreSuppliers');
      if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
      const savedShopping = localStorage.getItem('outletStoreShopping');
      if (savedShopping) setShoppingList(JSON.parse(savedShopping));
      const savedRates = localStorage.getItem('outletStoreRates');
      if (savedRates) setPaymentRates(JSON.parse(savedRates));
      const savedCustomers = localStorage.getItem('outletStoreCustomers');
      if (savedCustomers) setCustomers(JSON.parse(savedCustomers));
      const savedSales = localStorage.getItem('outletStoreSales');
      if (savedSales) setSales(JSON.parse(savedSales));

      // Default View based on Permissions
      if (user.permissions.canViewDashboard) setView('dashboard');
      else setView('sales');
   };

   const handleLogout = () => {
      setCurrentUser(null);
      // Cart state is now in SalesScreen, so no need to reset here, 
      // or we might want to force reset if SalesScreen is mounted.
      // But since we unmount App, SalesScreen state is lost anyway? 
      // No, App is not unmounted, just currentUser changes.
      // If we want to clear SalesScreen state, we might need a key or ref.
      // For now, let's just clear currentUser.
   };

   useEffect(() => {
      localStorage.setItem('outletStoreDarkMode', JSON.stringify(darkMode));
      if (darkMode) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
   }, [darkMode]);

   // Handle Role Change to update default permissions
   const handleRoleChange = (role: UserRole) => {
      setNewUser({ ...newUser, role });
      if (role === 'admin') setNewPermissions(DEFAULT_ADMIN_PERMISSIONS);
      else if (role === 'manager') setNewPermissions(DEFAULT_MANAGER_PERMISSIONS);
      else setNewPermissions(DEFAULT_SELLER_PERMISSIONS);
   };

   const handleTogglePermission = (key: keyof UserPermissions) => {
      setNewPermissions(prev => ({ ...prev, [key]: !prev[key] }));
   };

   // --- HELPERS ---
   const getVal = (val: string) => parseFloat(val.replace(',', '.')) || 0;

   const dollar = getVal(settings.dollarPrice);
   const rate = getVal(settings.exchangeRate);
   const freight = getVal(settings.freightPercent);
   const retailMarkup = getVal(settings.retailMarkup);
   const wholesaleMarkup = getVal(settings.wholesaleMarkup);

   const baseRealValue = dollar * rate;
   const freightValue = baseRealValue * (freight / 100);
   const costNoFreight = roundUpToFive(baseRealValue);
   const finalCost = roundUpToFive(baseRealValue + freightValue);

   const calculateRetail = () => {
      let price = form.manualRetailPrice ? parseFloat(form.manualRetailPrice) : roundUpToFive(finalCost * (1 + retailMarkup / 100));
      const margin = finalCost > 0 ? ((price / finalCost) - 1) * 100 : 0;
      return { price, margin };
   };

   const calculateWholesale = () => {
      let price = form.manualWholesalePrice ? parseFloat(form.manualWholesalePrice) : roundUpToFive(finalCost * (1 + wholesaleMarkup / 100));
      const margin = finalCost > 0 ? ((price / finalCost) - 1) * 100 : 0;
      return { price, margin };
   };

   const retailData = calculateRetail();
   const wholesaleData = calculateWholesale();

   // --- ACTIONS ---

   const handleLaunch = () => {
      if (!form.model || finalCost <= 0) return alert("Preencha Modelo e Custos corretamente.");

      const itemData: InventoryItem = {
         id: editingId || Date.now(),
         date: new Date().toISOString(),
         purchaseDate: form.purchaseDate,
         warrantyEnd: calculateWarrantyEnd(form.purchaseDate).toISOString(),
         model: form.model,
         capacity: form.capacity,
         color: form.color,
         condition: form.condition,
         imei: form.imei,
         battery: form.battery,
         supplier: form.supplier,
         costNoFreight,
         cost: finalCost,
         retailPrice: retailData.price,
         wholesalePrice: wholesaleData.price,
         retailProfit: retailData.price - finalCost,
         wholesaleProfit: wholesaleData.price - finalCost,
         status: 'available'
      };

      if (editingId) {
         setInventory(prev => prev.map(item => item.id === editingId ? { ...item, ...itemData, status: item.status } : item));
         setEditingId(null);
         alert("Item atualizado!");
      } else {
         setInventory(prev => [itemData, ...prev]);
         alert("Entrada realizada com sucesso!");
      }

      setForm(prev => ({ ...prev, imei: '', battery: '', manualRetailPrice: '', manualWholesalePrice: '' }));
      setSecurityResult(null);
   };

   // --- CART & POS ACTIONS (V4.0) ---
   const handleSaleComplete = (sale: Sale, customer: Customer, soldItems: SaleItem[]) => {
      // Update Inventory
      const updatedInventory = inventory.map(i => {
         const soldItem = soldItems.find(c => c.inventoryId === i.id);
         if (soldItem) {
            return {
               ...i,
               status: 'sold' as const,
               soldDate: new Date().toISOString(),
               soldPrice: soldItem.price,
               customerId: customer.id
            };
         }
         return i;
      });

      setInventory(updatedInventory);
      setSales([sale, ...sales]);

      // Print
      setCurrentSalePrint({ sale, customer });
      setTimeout(() => handlePrint('receipt'), 500);

      alert("Venda realizada com sucesso!");
   };

   // handleLogout

   const handleAddCustomer = () => {
      if (!newCustomer.name || !newCustomer.phone) return alert("Nome e Telefone obrigatórios");
      setCustomers([...customers, { ...newCustomer, id: Date.now().toString(), createdAt: new Date().toISOString() }]);
      setNewCustomer({ id: '', name: '', cpf: '', phone: '', address: '', createdAt: '' });
   };

   const handleAddSupplier = () => {
      if (!newSupplier.name) return;
      setSuppliers([...suppliers, { ...newSupplier, id: Date.now().toString() }]);
      setNewSupplier({ id: '', name: '', contact: '', pixKey: '', notes: '' });
   };

   const handleAddShoppingItem = () => {
      if (!newShoppingItem.desc) return;
      setShoppingList([...shoppingList, { id: Date.now().toString(), description: newShoppingItem.desc, targetPrice: newShoppingItem.price, status: 'pending' }]);
      setNewShoppingItem({ desc: '', price: '' });
   };

   const handleLaunchFromShopping = (item: ShoppingItem) => {
      const updatedList = shoppingList.map(i => i.id === item.id ? { ...i, status: 'bought' as const } : i);
      setShoppingList(updatedList);
      setForm(prev => ({ ...prev, model: item.description }));
      setView('purchases');
   };

   const handleUpdateRates = (index: number, field: 'costPercent' | 'passPercent', value: string) => {
      const newVal = parseFloat(value) || 0;
      const newRates = [...paymentRates];
      newRates[index] = { ...newRates[index], [field]: newVal };
      setPaymentRates(newRates);
   };

   // Team Management
   const handleCreateUser = () => {
      if (!newUser.name || !newUser.email || !newUser.password) return alert("Preencha tudo");
      if (users.find(u => u.email === newUser.email)) return alert("Email já existe");

      const u: User = {
         id: Date.now().toString(),
         name: newUser.name,
         email: newUser.email,
         password: newUser.password, // Hash in real app
         role: newUser.role,
         permissions: newPermissions,
         active: true
      };
      setUsers([...users, u]);
      setNewUser({ name: '', email: '', password: '', role: 'seller' });
      setNewPermissions(DEFAULT_SELLER_PERMISSIONS);
   };

   const handleCheckSecurity = async () => {
      if (!form.imei) return alert("Digite o IMEI/Serial");
      setIsProcessing(true);
      try {
         const result = await GeminiService.identifyDevice(form.imei);
         setSecurityResult(result);
      } finally {
         setIsProcessing(false);
      }
   };

   const handlePrint = (mode: PrintMode) => {
      setPrintMode(mode);
      setTimeout(() => window.print(), 100);
   };

   if (!currentUser) return <AuthScreen onLogin={handleLogin} users={users} />;

   // --- PERMISSIONS LOGIC ---
   const canAccessPurchases = currentUser.permissions?.canManageInventory ?? false;
   const canAccessManagement = currentUser.permissions?.canManageSuppliers ?? false;
   const canAccessCalculator = currentUser.permissions?.canAccessCalculator ?? false;
   const canAccessTeam = currentUser.permissions?.canManageTeam ?? false;
   const canViewDashboard = currentUser.permissions?.canViewDashboard ?? false;

   return (
      <div className="min-h-screen pb-20 relative bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-inter">
         <PrintLayout mode={printMode} inventory={inventory} currentSale={currentSalePrint} />

         {/* --- RATE CONFIG MODAL --- */}
         {showRateModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1100] p-4">
               <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="p-4 border-b dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
                     <h3 className="font-bold text-lg dark:text-white">Configurar Taxas (Maquininha)</h3>
                     <button onClick={() => setShowRateModal(false)}><X className="text-slate-500" /></button>
                  </div>
                  <div className="overflow-y-auto p-4 space-y-2 flex-1">
                     <div className="grid grid-cols-3 gap-2 font-bold text-xs uppercase text-slate-500 mb-2">
                        <span>Parcela</span>
                        <span>% Custo (Real)</span>
                        <span>% Repasse (Cliente)</span>
                     </div>
                     {paymentRates.map((rate, idx) => (
                        <div key={rate.installments} className="grid grid-cols-3 gap-2 items-center">
                           <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{rate.installments}x</span>
                           <input
                              type="number"
                              value={rate.costPercent}
                              onChange={e => handleUpdateRates(idx, 'costPercent', e.target.value)}
                              className="p-2 border rounded text-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                           />
                           <input
                              type="number"
                              value={rate.passPercent}
                              onChange={e => handleUpdateRates(idx, 'passPercent', e.target.value)}
                              className="p-2 border rounded text-slate-900 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                           />
                        </div>
                     ))}
                  </div>
                  <div className="p-4 border-t dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                     <button onClick={() => setShowRateModal(false)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl">Salvar Taxas</button>
                  </div>
               </div>
            </div>
         )}

         {/* --- HEADER --- */}
         <div className="max-w-7xl mx-auto p-4 no-print">
            <header className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
               <div className="flex items-center gap-3">
                  <div className="bg-indigo-600 p-2 rounded-lg"><Package className="text-white" /></div>
                  <div>
                     <h1 className="text-xl font-bold">Outlet Store+ <span className="text-indigo-400 text-xs px-1 border border-indigo-400 rounded">ERP v4.0</span></h1>
                     <div className="flex items-center gap-2">
                        <p className="text-slate-400 text-xs">Olá, {currentUser.name}</p>
                        <span className="text-[10px] bg-slate-700 px-2 rounded uppercase">{currentUser.role}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-3">
                  <div className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                     {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />} {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </div>
                  <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition">
                     {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  <button onClick={handleLogout} className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/40 transition flex gap-1 items-center text-xs font-bold">
                     <LogOut size={16} /> Sair
                  </button>
               </div>
            </header>

            {/* --- NAVIGATION TABS (DESKTOP) --- */}
            <div className="hidden md:flex gap-2 mb-6 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 w-fit">
               {[
                  { id: 'purchases', icon: ShoppingBag, label: 'Entrada', show: canAccessPurchases },
                  { id: 'inventory', icon: Package, label: 'Estoque', show: true },
                  { id: 'sales', icon: CreditCard, label: 'PDV', show: true },
                  { id: 'customers', icon: Users, label: 'Clientes', show: true },
                  { id: 'dashboard', icon: LayoutDashboard, label: 'Dash', show: canViewDashboard },
                  { id: 'management', icon: ListChecks, label: 'Gestão', show: canAccessManagement },
                  { id: 'calculator', icon: Calculator, label: 'Calc', show: canAccessCalculator },
                  { id: 'team', icon: UserCog, label: 'Equipe', show: canAccessTeam },
               ].filter(t => t.show).map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setView(tab.id as ViewMode)}
                     className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm transition ${view === tab.id ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'}`}
                  >
                     <tab.icon size={16} /> {tab.label}
                  </button>
               ))}
            </div>

            {/* --- VIEW: PURCHASES (ENTRY) --- */}
            {view === 'purchases' && canAccessPurchases && (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                  <div className="lg:col-span-4 space-y-4">
                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex gap-2"><DollarSign size={18} /> Parâmetros</h3>
                        <div className="grid grid-cols-2 gap-3 mb-3">
                           <input type="number" placeholder="Dólar" value={settings.dollarPrice} onChange={e => setSettings({ ...settings, dollarPrice: e.target.value })} className="p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 rounded-lg dark:border-slate-700 dark:text-white" />
                           <input type="number" placeholder="Cotação" value={settings.exchangeRate} onChange={e => setSettings({ ...settings, exchangeRate: e.target.value })} className="p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 rounded-lg dark:border-slate-700 dark:text-white" />
                        </div>
                        <input type="number" placeholder="Frete %" value={settings.freightPercent} onChange={e => setSettings({ ...settings, freightPercent: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 rounded-lg dark:border-slate-700 dark:text-white mb-4" />

                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                           <span className="text-sm font-bold text-slate-500">Custo Final</span>
                           <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(finalCost)}</span>
                        </div>
                     </div>

                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="font-bold text-slate-700 dark:text-white mb-4 flex gap-2"><TrendingUp size={18} /> Precificação</h3>
                        <div className="space-y-3">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase">Margem Varejo %</label>
                              <input type="number" value={settings.retailMarkup} onChange={e => setSettings({ ...settings, retailMarkup: e.target.value })} className="w-full p-2 border rounded bg-slate-50 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                           </div>
                           <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900">
                              <div className="flex justify-between items-center">
                                 <span className="text-xs font-bold text-blue-800 dark:text-blue-300">PREÇO SUGERIDO</span>
                                 <span className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(retailData.price)}</span>
                              </div>
                              <input type="number" placeholder="Manual" value={form.manualRetailPrice} onChange={e => setForm({ ...form, manualRetailPrice: e.target.value })} className="w-full mt-2 p-2 text-right font-bold text-blue-700 bg-white border border-blue-200 rounded dark:bg-slate-950 dark:border-slate-700" />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="lg:col-span-8">
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-xl font-bold text-slate-800 dark:text-white">Entrada de Mercadoria</h2>
                           <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-500 font-mono">ID: {Date.now().toString().slice(-6)}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                           <div className="md:col-span-2">
                              <label className="text-xs font-bold text-slate-500 mb-1 block">Modelo</label>
                              <input list="models" value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 border-slate-300 dark:border-slate-700 rounded-xl outline-none dark:text-white font-medium" placeholder="Ex: iPhone 13" />
                              <datalist id="models">{IPHONE_MODELS.map(m => <option key={m} value={m} />)}</datalist>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-1 block">Capacidade</label>
                              <select value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 border-slate-300 dark:border-slate-700 rounded-xl outline-none dark:text-white">
                                 <option value="">Selecione...</option>
                                 {['64GB', '128GB', '256GB', '512GB', '1TB'].map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-1 block">Cor</label>
                              <input list="colors" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 border-slate-300 dark:border-slate-700 rounded-xl outline-none dark:text-white" />
                              <datalist id="colors">{APPLE_COLORS.map(c => <option key={c} value={c} />)}</datalist>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-1 block">Condição</label>
                              <select value={form.condition} onChange={e => setForm({ ...form, condition: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 border-slate-300 dark:border-slate-700 rounded-xl outline-none dark:text-white">
                                 <option value="Novo">Novo (Lacrado)</option>
                                 <option value="Seminovo Grade A">Seminovo Grade A</option>
                                 <option value="Seminovo Grade B">Seminovo Grade B</option>
                                 <option value="Vitrine">Vitrine</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 mb-1 block">Bateria %</label>
                              <input type="number" value={form.battery} onChange={e => setForm({ ...form, battery: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 border-slate-300 dark:border-slate-700 rounded-xl outline-none dark:text-white" />
                           </div>
                           <div className="md:col-span-2 relative">
                              <label className="text-xs font-bold text-slate-500 mb-1 block">IMEI / Serial</label>
                              <div className="flex gap-2">
                                 <input type="text" value={form.imei} onChange={e => setForm({ ...form, imei: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border text-slate-900 border-slate-300 dark:border-slate-700 rounded-xl outline-none dark:text-white uppercase font-mono" placeholder="Serial único" />
                                 <button onClick={handleCheckSecurity} className="bg-slate-200 dark:bg-slate-700 px-4 rounded-xl text-slate-600 dark:text-white hover:bg-slate-300 transition">
                                    {isProcessing ? <span className="animate-spin">⌛</span> : <Search size={20} />}
                                 </button>
                              </div>
                           </div>
                        </div>

                        {/* Security Hub */}
                        {securityResult && (
                           <div className="mb-4 bg-slate-100 dark:bg-slate-800 p-4 rounded-xl border-l-4 border-blue-500 animate-in fade-in">
                              <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1 flex items-center gap-2"><ShieldCheck size={16} /> Resultado da Análise</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{securityResult.identifiedModel} - {securityResult.riskAssessment}</p>
                              <div className="flex gap-2">
                                 <a href="https://www.gov.br/anatel/pt-br/assuntos/celular-legal/consulte-sua-situacao" target="_blank" onClick={() => navigator.clipboard.writeText(form.imei)} className="text-xs bg-white dark:bg-slate-700 border dark:border-slate-600 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white transition">
                                    🇧🇷 Gov.br (Copiar)
                                 </a>
                                 <a href="https://iunlocker.com/check_imei.php" target="_blank" onClick={() => navigator.clipboard.writeText(form.imei)} className="text-xs bg-white dark:bg-slate-700 border dark:border-slate-600 px-3 py-1.5 rounded flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-600 dark:text-white transition">
                                    🍎 iCloud (Copiar)
                                 </a>
                              </div>
                           </div>
                        )}

                        <button onClick={handleLaunch} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition flex justify-center items-center gap-2">
                           <Save size={20} /> Confirmar Entrada
                        </button>
                     </div>
                  </div>
               </div>
            )}

            {/* --- VIEW: INVENTORY --- */}
            {view === 'inventory' && (
               <div className="animate-in fade-in space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase">Em Estoque</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{inventory.filter(i => i.status === 'available').length}</p>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase">Vendidos</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{inventory.filter(i => i.status === 'sold').length}</p>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                        <p className="text-xs font-bold text-slate-500 uppercase">Valor Estoque</p>
                        {canAccessPurchases ? (
                           <p className="text-2xl font-black text-blue-600">{formatCurrency(inventory.filter(i => i.status === 'available').reduce((a, c) => a + c.cost, 0))}</p>
                        ) : <p className="text-xl text-slate-400">Restrito</p>}
                     </div>
                  </div>
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                     <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2"><Package size={18} /> Inventário Geral</h3>
                        <button onClick={() => handlePrint('labels')} className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-white transition">
                           <Tag size={14} /> Etiquetas
                        </button>
                     </div>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                           <thead className="bg-slate-50 dark:bg-slate-950 text-xs uppercase font-bold text-slate-500">
                              <tr>
                                 <th className="p-4">Status</th>
                                 <th className="p-4">Modelo</th>
                                 <th className="p-4">IMEI</th>
                                 {canAccessPurchases && <th className="p-4 text-right">Custo</th>}
                                 <th className="p-4 text-right">Venda</th>
                                 {canAccessPurchases && <th className="p-4 text-center">Ações</th>}
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {inventory.map(item => (
                                 <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                    <td className="p-4">
                                       <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${item.status === 'sold' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                          {item.status === 'sold' ? 'VENDIDO' : 'DISPONÍVEL'}
                                       </span>
                                    </td>
                                    <td className="p-4">
                                       <div className="font-bold text-slate-800 dark:text-white">{item.model}</div>
                                       <div className="text-xs text-slate-500">{item.capacity} • {item.color}</div>
                                    </td>
                                    <td className="p-4 font-mono text-slate-600 dark:text-slate-400">{item.imei}</td>
                                    {canAccessPurchases && <td className="p-4 text-right font-medium text-slate-500">{formatCurrency(item.cost)}</td>}
                                    <td className="p-4 text-right font-bold text-slate-800 dark:text-white">
                                       {formatCurrency(item.status === 'sold' ? (item.soldPrice || 0) : item.retailPrice)}
                                    </td>
                                    {canAccessPurchases && (
                                       <td className="p-4 text-center">
                                          {item.status === 'available' && (
                                             <button onClick={() => { setEditingId(item.id); setForm({ ...item, manualRetailPrice: item.retailPrice.toString(), manualWholesalePrice: item.wholesalePrice.toString() }); setView('purchases'); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-blue-600">
                                                <Pencil size={16} />
                                             </button>
                                          )}
                                       </td>
                                    )}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {/* --- VIEW: SALES (POS V4.0 - CART & MULTI-PAYMENT) --- */}
            {view === 'sales' && (
               <SalesScreen
                  inventory={inventory}
                  customers={customers}
                  currentUser={currentUser}
                  onSaleComplete={handleSaleComplete}
                  onAddCustomer={() => setView('customers')}
               />
            )}

            {/* --- VIEW: TEAM (USER MANAGEMENT) --- */}
            {view === 'team' && canAccessTeam && (
               <div className="max-w-4xl mx-auto animate-in fade-in">
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2"><UserCog size={24} /> Gestão de Equipe</h2>

                     <div className="mb-8 bg-slate-50 dark:bg-slate-800 p-6 rounded-xl border dark:border-slate-700">
                        <h3 className="font-bold text-sm text-slate-500 mb-4 uppercase">Adicionar Novo Usuário</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                           <div>
                              <label className="text-xs font-bold text-slate-500">Nome</label>
                              <input type="text" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full p-2 rounded border bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500">Email</label>
                              <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="w-full p-2 rounded border bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500">Senha</label>
                              <input type="text" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full p-2 rounded border bg-white dark:bg-slate-900 text-slate-900 dark:text-white" />
                           </div>
                        </div>

                        <div className="mb-4">
                           <label className="text-xs font-bold text-slate-500 mb-2 block">Cargo</label>
                           <select value={newUser.role} onChange={e => handleRoleChange(e.target.value as UserRole)} className="w-full md:w-1/3 p-2 rounded border bg-white dark:bg-slate-900 text-slate-900 dark:text-white mb-4">
                              <option value="seller">Vendedor</option>
                              <option value="manager">Gerente</option>
                              <option value="admin">Administrador</option>
                           </select>

                           <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border dark:border-slate-700">
                              <p className="text-xs font-bold text-slate-400 uppercase mb-3">Permissões de Acesso:</p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                                    <button onClick={() => handleTogglePermission('canManageInventory')}>
                                       {newPermissions.canManageInventory ? <CheckSquare className="text-blue-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                                    </button>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Entrada de Estoque & Custos</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                                    <button onClick={() => handleTogglePermission('canViewDashboard')}>
                                       {newPermissions.canViewDashboard ? <CheckSquare className="text-blue-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                                    </button>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Dashboard & Lucros</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                                    <button onClick={() => handleTogglePermission('canManageSuppliers')}>
                                       {newPermissions.canManageSuppliers ? <CheckSquare className="text-blue-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                                    </button>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fornecedores & Compras</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                                    <button onClick={() => handleTogglePermission('canAccessCalculator')}>
                                       {newPermissions.canAccessCalculator ? <CheckSquare className="text-blue-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                                    </button>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Calculadora Financeira</span>
                                 </label>
                                 <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                                    <button onClick={() => handleTogglePermission('canManageTeam')}>
                                       {newPermissions.canManageTeam ? <CheckSquare className="text-blue-600" size={20} /> : <Square className="text-slate-400" size={20} />}
                                    </button>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Gestão de Equipe (Admin)</span>
                                 </label>
                              </div>
                           </div>
                        </div>

                        <button onClick={handleCreateUser} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow transition flex items-center gap-2">
                           <UserPlus size={18} /> Cadastrar Usuário
                        </button>
                     </div>

                     <div className="space-y-3">
                        {users.map(u => (
                           <div key={u.id} className="flex justify-between items-center p-4 border rounded-xl dark:border-slate-700">
                              <div>
                                 <p className="font-bold text-slate-800 dark:text-white">{u.name}</p>
                                 <p className="text-sm text-slate-500">{u.email}</p>
                                 <div className="flex gap-2 mt-1">
                                    {u.permissions?.canManageInventory && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500">Estoque</span>}
                                    {u.permissions?.canViewDashboard && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500">Dash</span>}
                                    {u.permissions?.canAccessCalculator && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1 rounded text-slate-500">Calc</span>}
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : u.role === 'manager' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{u.role}</span>
                                 {u.id !== currentUser.id && (
                                    <button onClick={() => setUsers(users.filter(x => x.id !== u.id))} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {/* --- VIEW: CUSTOMERS --- */}
            {view === 'customers' && (
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in">
                  <div className="lg:col-span-4">
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <h2 className="text-xl font-bold text-slate-700 dark:text-white mb-4">Novo Cliente</h2>
                        <div className="space-y-3">
                           <input type="text" placeholder="Nome Completo" value={newCustomer.name} onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:border-slate-700 dark:text-white" />
                           <input type="text" placeholder="CPF" value={newCustomer.cpf} onChange={e => setNewCustomer({ ...newCustomer, cpf: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:border-slate-700 dark:text-white" />
                           <input type="text" placeholder="Telefone" value={newCustomer.phone} onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:border-slate-700 dark:text-white" />
                           <textarea placeholder="Endereço" value={newCustomer.address} onChange={e => setNewCustomer({ ...newCustomer, address: e.target.value })} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl text-slate-900 dark:border-slate-700 dark:text-white h-24 resize-none" />
                           <button onClick={handleAddCustomer} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">Salvar Cliente</button>
                        </div>
                     </div>
                  </div>
                  <div className="lg:col-span-8 space-y-4">
                     {customers.map(c => (
                        <div key={c.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
                           <div><h3 className="font-bold text-lg text-slate-800 dark:text-white">{c.name}</h3><p className="text-sm text-slate-500">{c.phone}</p></div>
                           <div className="text-2xl font-black text-blue-600">{sales.filter(s => s.customerId === c.id).length}</div>
                        </div>
                     ))}
                     {customers.length === 0 && <p className="text-center text-slate-400">Nenhum cliente.</p>}
                  </div>
               </div>
            )}

            {/* --- VIEW: DASHBOARD --- */}
            {view === 'dashboard' && canViewDashboard && (
               <div className="animate-in fade-in space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white p-5 rounded-2xl shadow-lg">
                        <p className="text-blue-200 text-xs uppercase font-bold">Vendas Totais</p>
                        <p className="text-2xl font-black">{formatCurrency(sales.reduce((acc, curr) => acc + curr.totalPrice, 0))}</p>
                     </div>
                     <div className="bg-gradient-to-br from-emerald-500 to-teal-700 text-white p-5 rounded-2xl shadow-lg">
                        <p className="text-emerald-200 text-xs uppercase font-bold">Lucro Estimado</p>
                        <p className="text-2xl font-black">{formatCurrency(inventory.reduce((acc, curr) => acc + (curr.status === 'sold' ? (curr.soldPrice || 0) - curr.cost : 0), 0))}</p>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800">
                        <p className="text-slate-500 text-xs uppercase font-bold">Estoque (Custo)</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(inventory.filter(i => i.status === 'available').reduce((acc, curr) => acc + curr.cost, 0))}</p>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border dark:border-slate-800">
                        <p className="text-slate-500 text-xs uppercase font-bold">Ticket Médio</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-white">{sales.length > 0 ? formatCurrency(sales.reduce((acc, s) => acc + s.totalPrice, 0) / sales.length) : 'R$ 0'}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800">
                        <h3 className="font-bold text-slate-700 dark:text-white mb-4">Top Modelos Vendidos</h3>
                        <div className="space-y-3">
                           {/* Logic simplified for demo */}
                           {sales.length === 0 && <p className="text-slate-500 text-sm">Sem dados.</p>}
                        </div>
                     </div>
                     <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800">
                        <h3 className="font-bold text-slate-700 dark:text-white mb-4">Últimas Vendas</h3>
                        <div className="space-y-2">
                           {sales.slice(0, 5).map(s => (
                              <div key={s.id} className="flex justify-between items-center p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded">
                                 <div><p className="text-sm font-bold dark:text-white">{s.items.length} itens</p><p className="text-xs text-slate-500">{s.customerName}</p></div>
                                 <span className="text-sm font-bold text-green-600">{formatCurrency(s.totalPrice)}</span>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* --- VIEW: MANAGEMENT (SUPPLIERS & SHOPPING) --- */}
            {view === 'management' && canAccessManagement && (
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in">
                  {/* Suppliers */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 h-fit">
                     <h2 className="font-bold text-xl mb-4 flex items-center gap-2 dark:text-white"><Truck size={20} /> Fornecedores</h2>
                     <div className="flex gap-2 mb-4">
                        <input type="text" placeholder="Nome" value={newSupplier.name} onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })} className="flex-1 p-2 border rounded bg-slate-50 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        <input type="text" placeholder="Contato" value={newSupplier.contact} onChange={e => setNewSupplier({ ...newSupplier, contact: e.target.value })} className="w-1/3 p-2 border rounded bg-slate-50 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        <button onClick={handleAddSupplier} className="bg-blue-600 text-white p-2 rounded"><Plus size={20} /></button>
                     </div>
                     <div className="space-y-2 max-h-64 overflow-y-auto">
                        {suppliers.map(s => (
                           <div key={s.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded flex justify-between items-center">
                              <div><p className="font-bold text-sm dark:text-white">{s.name}</p><p className="text-xs text-slate-500">{s.contact}</p></div>
                              <button onClick={() => setSuppliers(suppliers.filter(x => x.id !== s.id))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Shopping List */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800">
                     <h2 className="font-bold text-xl mb-4 flex items-center gap-2 dark:text-white"><ShoppingCart size={20} /> Lista de Compras</h2>
                     <div className="flex gap-2 mb-4">
                        <input type="text" placeholder="Item (ex: iPhone 13 128)" value={newShoppingItem.desc} onChange={e => setNewShoppingItem({ ...newShoppingItem, desc: e.target.value })} className="flex-1 p-2 border rounded bg-slate-50 text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        <button onClick={handleAddShoppingItem} className="bg-emerald-600 text-white p-2 rounded"><Plus size={20} /></button>
                     </div>
                     <div className="space-y-2">
                        {shoppingList.filter(i => i.status !== 'bought').map(item => (
                           <div key={item.id} className="p-3 border dark:border-slate-700 rounded flex justify-between items-center">
                              <span className="font-medium text-sm dark:text-white">{item.description}</span>
                              <button onClick={() => handleLaunchFromShopping(item)} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold hover:bg-blue-200">Lançar no Estoque</button>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            )}

            {/* --- VIEW: CALCULATOR --- */}
            {view === 'calculator' && canAccessCalculator && (
               <div className="max-w-2xl mx-auto animate-in fade-in bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-lg">
                  <div className="flex justify-between items-center mb-6">
                     <h2 className="text-2xl font-black text-slate-800 dark:text-white">Calculadora Financeira</h2>
                     <div className="flex items-center gap-2">
                        <button onClick={() => setShowRateModal(true)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                           <Settings size={20} />
                        </button>
                        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex text-xs font-bold">
                           <button onClick={() => setCalcMode('pricing')} className={`px-4 py-2 rounded-md transition ${calcMode === 'pricing' ? 'bg-white dark:bg-slate-600 shadow text-blue-600 dark:text-white' : 'text-slate-500'}`}>Precificação (Gross Up)</button>
                           <button onClick={() => setCalcMode('simulation')} className={`px-4 py-2 rounded-md transition ${calcMode === 'simulation' ? 'bg-white dark:bg-slate-600 shadow text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>Simulação (Net Down)</button>
                        </div>
                     </div>
                  </div>

                  <div className="mb-8 text-center">
                     <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{calcMode === 'pricing' ? 'QUANTO VOCÊ QUER RECEBER LÍQUIDO?' : 'QUAL O VALOR DA VENDA (BRUTO)?'}</label>
                     <div className="flex justify-center items-center gap-2">
                        <span className="text-2xl text-slate-400">R$</span>
                        <input
                           type="number"
                           value={calcValue}
                           onChange={e => setCalcValue(e.target.value)}
                           className="text-5xl font-black bg-transparent outline-none w-48 text-center dark:text-white text-slate-900"
                           placeholder="0"
                           autoFocus
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                     {paymentRates.slice(0, 12).map(rate => {
                        const val = parseFloat(calcValue) || 0;
                        let resultLine = null;

                        if (calcMode === 'pricing') {
                           // Gross Up: Valor / (1 - Taxa)
                           const totalToCharge = val / (1 - (rate.passPercent / 100));
                           const installmentVal = totalToCharge / rate.installments;
                           resultLine = (
                              <div className="flex justify-between items-center">
                                 <span className="font-bold text-slate-700 dark:text-slate-300">{rate.installments}x de {formatCurrency(installmentVal)}</span>
                                 <span className="text-sm font-mono text-slate-500">Total: {formatCurrency(totalToCharge)}</span>
                              </div>
                           );
                        } else {
                           // Net Down: Valor * (1 - Custo)
                           const netReceive = val * (1 - (rate.costPercent / 100));
                           resultLine = (
                              <div className="flex justify-between items-center">
                                 <span className="text-sm text-slate-500">{rate.installments}x (Taxa {rate.costPercent}%)</span>
                                 <span className="font-bold text-emerald-600 dark:text-emerald-400">Sobra: {formatCurrency(netReceive)}</span>
                              </div>
                           );
                        }

                        return (
                           <div key={rate.installments} className="p-3 border-b dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                              {resultLine}
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}

            {/* --- MOBILE NAV --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 p-2 flex justify-around z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
               {[
                  { id: 'purchases', icon: ShoppingBag, label: 'Entrada', show: canAccessPurchases },
                  { id: 'inventory', icon: Package, label: 'Estoque', show: true },
                  { id: 'sales', icon: CreditCard, label: 'PDV', show: true },
                  { id: 'customers', icon: Users, label: 'Clientes', show: true },
                  { id: 'calculator', icon: Calculator, label: 'Calc', show: canAccessCalculator },
               ].filter(t => t.show).map((tab) => (
                  <button
                     key={tab.id}
                     onClick={() => setView(tab.id as ViewMode)}
                     className={`flex flex-col items-center p-2 rounded-xl transition ${view === tab.id ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'text-slate-400'}`}
                  >
                     <tab.icon size={20} />
                     <span className="text-[10px] font-bold mt-1">{tab.label}</span>
                  </button>
               ))}
            </div>

         </div>
      </div>
   );
};

export default App;
