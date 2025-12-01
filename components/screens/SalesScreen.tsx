import React, { useState } from 'react';
import { Search, Plus, CheckCircle, ShoppingCart, XCircle, X } from 'lucide-react';
import { InventoryItem, Customer, Sale, SaleItem, SalePayment, User } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface SalesScreenProps {
    inventory: InventoryItem[];
    customers: Customer[];
    currentUser: User;
    onSaleComplete: (sale: Sale, customer: Customer, soldItems: SaleItem[]) => void;
    onAddCustomer: () => void; // To navigate to customer creation
}

const SalesScreen: React.FC<SalesScreenProps> = ({ inventory, customers, currentUser, onSaleComplete, onAddCustomer }) => {
    const [cart, setCart] = useState<SaleItem[]>([]);
    const [cartCustomer, setCartCustomer] = useState<string>('');
    const [cartPayments, setCartPayments] = useState<SalePayment[]>([]);

    const handleAddToCart = (itemId: string) => {
        const item = inventory.find(i => i.id === parseInt(itemId));
        if (!item) return;
        if (cart.find(c => c.inventoryId === item.id)) return alert("Item já está no carrinho");

        const saleItem: SaleItem = {
            inventoryId: item.id,
            model: item.model,
            imei: item.imei,
            capacity: item.capacity,
            color: item.color,
            condition: item.condition,
            battery: item.battery,
            price: item.retailPrice
        };
        setCart([...cart, saleItem]);
    };

    const handleRemoveFromCart = (idx: number) => {
        setCart(cart.filter((_, i) => i !== idx));
    };

    const handleAddPayment = (method: string, amount: string) => {
        const val = parseFloat(amount);
        if (!val || val <= 0) return;
        setCartPayments([...cartPayments, { id: Date.now().toString(), method: method as any, amount: val }]);
    };

    const handleRemovePayment = (idx: number) => {
        setCartPayments(cartPayments.filter((_, i) => i !== idx));
    };

    const handleFinalizeSale = () => {
        if (!cartCustomer) return alert("Selecione o Cliente");
        if (cart.length === 0) return alert("Carrinho vazio");

        const totalCart = cart.reduce((a, c) => a + c.price, 0);
        const totalPaid = cartPayments.reduce((a, c) => a + c.amount, 0);

        // Allow slight difference for rounding, but generally should match or warn
        if (totalPaid < totalCart) return alert(`Pagamento incompleto. Faltam ${formatCurrency(totalCart - totalPaid)}`);

        const customer = customers.find(c => c.id === cartCustomer);
        if (!customer) return;

        const saleData: Sale = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            customerId: customer.id,
            customerName: customer.name,
            items: cart,
            payments: cartPayments,
            totalPrice: totalCart,
            soldByUserId: currentUser?.id || '',
            soldByUserName: currentUser?.name || ''
        };

        onSaleComplete(saleData, customer, cart);

        // Reset
        setCart([]);
        setCartPayments([]);
        setCartCustomer('');
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in h-[calc(100vh-140px)]">
            {/* Left: Catalog */}
            <div className="lg:col-span-7 flex flex-col gap-4 overflow-hidden h-full">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex-shrink-0">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Catálogo Disponível</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                        <input type="text" placeholder="Buscar modelo ou IMEI..." className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none text-slate-800 dark:text-white" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {inventory.filter(i => i.status === 'available').map(item => (
                        <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center hover:border-indigo-500 transition cursor-pointer group" onClick={() => handleAddToCart(item.id.toString())}>
                            <div>
                                <p className="font-bold text-slate-800 dark:text-white">{item.model}</p>
                                <p className="text-xs text-slate-500">{item.capacity} • {item.color} • {item.condition}</p>
                                <p className="text-[10px] font-mono text-slate-400">{item.imei}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-indigo-600 dark:text-indigo-400 text-lg">{formatCurrency(item.retailPrice)}</p>
                                <span className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">+ Adicionar</span>
                            </div>
                        </div>
                    ))}
                    {inventory.filter(i => i.status === 'available').length === 0 && (
                        <div className="text-center text-slate-400 py-10">Estoque Vazio</div>
                    )}
                </div>
            </div>

            {/* Right: Cart & Checkout */}
            <div className="lg:col-span-5 flex flex-col h-full">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
                    <div className="bg-indigo-600 p-4 text-white">
                        <h2 className="text-lg font-black uppercase tracking-wide flex items-center gap-2"><ShoppingCart size={20} /> Carrinho</h2>
                    </div>

                    {/* Customer Select */}
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                        <select value={cartCustomer} onChange={e => setCartCustomer(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-white outline-none">
                            <option value="">Selecionar Cliente...</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <button onClick={onAddCustomer} className="text-xs text-indigo-500 font-bold mt-1 ml-1 hover:underline">Novo Cliente</button>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {cart.length === 0 ? (
                            <div className="text-center text-slate-400 py-10 text-sm">Carrinho vazio</div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2 last:border-0">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{item.model}</p>
                                        <p className="text-xs text-slate-500">{item.capacity} • {item.condition}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(item.price)}</span>
                                        <button onClick={() => handleRemoveFromCart(idx)} className="text-red-400 hover:text-red-600"><XCircle size={18} /></button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Payment Section */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-500 font-bold uppercase text-xs">Total a Pagar</span>
                            <span className="text-2xl font-black text-slate-800 dark:text-white">{formatCurrency(cart.reduce((a, c) => a + c.price, 0))}</span>
                        </div>

                        <div className="space-y-2 mb-4">
                            {cartPayments.map((p, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800">
                                    <span className="text-slate-600 dark:text-slate-300">{p.method}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 dark:text-white">{formatCurrency(p.amount)}</span>
                                        <button onClick={() => handleRemovePayment(idx)} className="text-red-400"><X size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 mb-4">
                            <select id="payMethod" className="flex-1 p-2 rounded-lg bg-white dark:bg-slate-900 border text-slate-900 dark:text-white border-slate-300 dark:border-slate-700">
                                <option value="PIX">PIX</option>
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Crédito">Crédito</option>
                                <option value="Débito">Débito</option>
                                <option value="Troca">Troca</option>
                            </select>
                            <input id="payAmount" type="number" placeholder="Valor" className="w-24 p-2 rounded-lg bg-white dark:bg-slate-900 border text-slate-900 dark:text-white border-slate-300 dark:border-slate-700" />
                            <button onClick={() => {
                                const method = (document.getElementById('payMethod') as HTMLSelectElement).value;
                                const amount = (document.getElementById('payAmount') as HTMLInputElement).value;
                                handleAddPayment(method, amount);
                                (document.getElementById('payAmount') as HTMLInputElement).value = '';
                            }} className="bg-emerald-600 text-white p-2 rounded-lg"><Plus size={20} /></button>
                        </div>

                        <button onClick={handleFinalizeSale} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg transition flex items-center justify-center gap-2">
                            <CheckCircle size={20} /> Finalizar Venda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesScreen;
