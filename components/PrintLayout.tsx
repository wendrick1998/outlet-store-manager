
import React from 'react';
import { InventoryItem, Sale, Customer } from '../types';
import { getDaysRemaining } from '../utils/helpers';

interface PrintLayoutProps {
  mode: 'none' | 'labels' | 'report' | 'receipt';
  inventory: InventoryItem[];
  currentSale?: { sale: Sale, customer: Customer } | null;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ mode, inventory, currentSale }) => {
  if (mode === 'none') return null;

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="print-only fixed inset-0 bg-white z-[9999] p-0 m-0 text-black">
      
      {/* --- MODO ETIQUETAS --- */}
      {mode === 'labels' && (
        <div className="grid grid-cols-2 gap-4 p-4">
          {inventory.filter(i => i.status === 'available').map((item) => {
            const daysRemaining = getDaysRemaining(item.warrantyEnd);
            return (
              <div key={item.id} className="border-2 border-black p-4 rounded-lg page-break h-[300px] flex flex-col relative">
                <div className="text-center border-b-2 border-black pb-2 mb-2">
                  <h1 className="text-xl font-serif font-black uppercase tracking-tight text-black">OUTLET STORE PLUS</h1>
                  <div className={`absolute top-2 right-2 text-[10px] px-2 py-0.5 font-bold uppercase border border-black ${item.condition === 'Novo' ? 'bg-black text-white' : 'bg-white text-black'}`}>
                    {item.condition}
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <h2 className="text-3xl font-serif font-bold leading-none mb-1 text-center text-black">{item.model}</h2>
                  <div className="flex justify-center gap-4 text-lg font-serif font-semibold text-gray-900 mt-1">
                    <span>{item.capacity.replace('GB', 'G')}</span>
                    <span>{item.color.split('/')[0].trim()}</span>
                  </div>
                  
                  <div className="text-center my-3">
                     <span className="font-bold text-base border-b border-black text-black">Bateria: {item.battery}%</span>
                  </div>
                  
                  <div className="flex justify-center gap-4 text-[10px] uppercase font-bold text-gray-900 mt-auto">
                     <span>{item.condition}</span>
                     <span>IMEI ✓</span>
                  </div>
                </div>

                <div className="text-center pt-2 border-t-2 border-black border-dashed mt-2 pb-2">
                   {item.imei && (
                     <>
                       {/* Barcode Scaled for Better Readability */}
                       <div className="barcode text-6xl leading-none transform scale-y-125 origin-bottom mb-2 px-4 text-black">*{item.imei}*</div>
                       <p className="font-mono text-sm tracking-[0.2em] font-bold text-black">{item.imei}</p>
                     </>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODO RELATÓRIO --- */}
      {mode === 'report' && (
        <div className="p-8 w-full max-w-[210mm] mx-auto text-black">
          <div className="text-center mb-8 border-b-2 border-black pb-6">
            <h1 className="text-3xl font-bold uppercase tracking-wider text-black">Relatório Geral de Estoque</h1>
            <p className="text-sm text-gray-600 mt-2">Outlet Store+ Management System</p>
            <div className="flex justify-center gap-8 mt-4 text-xs font-mono bg-gray-50 py-2 rounded border border-gray-200">
              <span>ITENS: <b>{inventory.filter(i => i.status === 'available').length}</b></span>
              <span>CUSTO TOTAL: <b>{formatCurrency(inventory.filter(i => i.status === 'available').reduce((a,c) => a + c.cost, 0))}</b></span>
              <span>VALOR VENDA (Varejo): <b>{formatCurrency(inventory.filter(i => i.status === 'available').reduce((a,c) => a + c.retailPrice, 0))}</b></span>
            </div>
          </div>

          <table className="w-full text-[10px] border-collapse border border-black text-black">
            <thead>
              <tr className="bg-gray-200 text-black uppercase tracking-wide">
                <th className="border border-black p-2 text-left">Status</th>
                <th className="border border-black p-2 text-left">Modelo</th>
                <th className="border border-black p-2 text-left">Specs</th>
                <th className="border border-black p-2 text-left">IMEI</th>
                <th className="border border-black p-2 text-right">Custo</th>
                <th className="border border-black p-2 text-right font-bold">Venda</th>
                <th className="border border-black p-2 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, index) => {
                return (
                  <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className={`border border-black p-2 font-bold uppercase ${item.status === 'sold' ? 'text-red-600' : 'text-green-600'}`}>
                      {item.status === 'sold' ? 'VENDIDO' : 'DISPONÍVEL'}
                    </td>
                    <td className="border border-black p-2 font-bold">{item.model}</td>
                    <td className="border border-black p-2">{item.capacity} - {item.color}</td>
                    <td className="border border-black p-2 font-mono">{item.imei}</td>
                    <td className="border border-black p-2 text-right font-medium">{formatCurrency(item.cost)}</td>
                    <td className="border border-black p-2 text-right font-bold">{formatCurrency(item.status === 'sold' ? (item.soldPrice || 0) : item.retailPrice)}</td>
                    <td className="border border-black p-2 text-right">{formatCurrency(item.status === 'sold' ? (item.soldPrice || 0) - item.cost : item.retailProfit)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="mt-8 text-[10px] text-gray-400 text-center pt-4 border-t">
            Documento gerado em {new Date().toLocaleString()}
          </div>
        </div>
      )}

      {/* --- MODO TERMO DE GARANTIA (RECEIPT) --- */}
      {mode === 'receipt' && currentSale && (
        <div className="p-10 max-w-[210mm] mx-auto font-serif text-black leading-relaxed">
          
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-6">
             <h1 className="text-3xl font-black uppercase tracking-widest text-black">OUTLET STORE PLUS</h1>
             <p className="text-sm mt-1">Soluções em Eletrônicos Premium</p>
             <p className="text-xs text-gray-500">Recibo de Venda & Termo de Garantia</p>
          </div>

          {/* Info Blocks */}
          <div className="flex justify-between mb-6 text-sm text-black">
             <div>
               <p className="font-bold uppercase mb-1">DADOS DO CLIENTE:</p>
               <p>{currentSale.customer.name}</p>
               <p>CPF: {currentSale.customer.cpf}</p>
               <p>Tel: {currentSale.customer.phone}</p>
             </div>
             <div className="text-right">
               <p className="font-bold uppercase mb-1">DETALHES DA VENDA:</p>
               <p>Data: {new Date(currentSale.sale.date).toLocaleString()}</p>
               <p>Recibo #: {currentSale.sale.id.slice(-6)}</p>
               <p>Vendedor: {currentSale.sale.soldByUserName}</p>
             </div>
          </div>

          {/* Product Box (Multi Item) */}
          <div className="border-2 border-black mb-6 rounded-lg bg-gray-50 text-black overflow-hidden">
             <div className="bg-gray-200 p-2 font-bold text-xs uppercase text-center border-b border-black">Produtos Adquiridos</div>
             {currentSale.sale.items.map((item, idx) => (
                <div key={idx} className="p-3 border-b border-black last:border-0 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold">{item.model}</h2>
                        <p className="text-xs">{item.capacity} • {item.color} • {item.condition}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-mono text-xs tracking-widest font-bold">{item.imei}</p>
                        <p className="text-[10px] uppercase font-bold">{formatCurrency(item.price)}</p>
                    </div>
                </div>
             ))}
             <div className="p-3 bg-gray-100 flex justify-between items-center border-t border-black">
                <span className="font-bold uppercase text-xs">Total Geral</span>
                <span className="font-black text-xl">{formatCurrency(currentSale.sale.totalPrice)}</span>
             </div>
          </div>
          
          {/* Payment Details */}
          <div className="mb-8 text-xs text-black border border-black p-2 rounded bg-gray-50">
             <p className="font-bold uppercase mb-1">Forma de Pagamento:</p>
             <div className="flex flex-wrap gap-4">
               {currentSale.sale.payments.map((p, i) => (
                 <span key={i} className="bg-white px-2 py-1 border border-black rounded">
                   {p.method}: {formatCurrency(p.amount)} {p.details ? `(${p.details})` : ''}
                 </span>
               ))}
             </div>
          </div>

          {/* Terms */}
          <div className="text-xs text-justify space-y-2 mb-12 text-black">
             <h3 className="font-bold uppercase text-sm border-b border-gray-300 pb-1 mb-2">Termos de Garantia (90 Dias)</h3>
             <p>1. <strong>COBERTURA:</strong> A Outlet Store Plus oferece garantia legal de 90 (noventa) dias a partir desta data, cobrindo exclusivamente vícios ocultos de funcionamento (placa, bateria, câmeras).</p>
             <p>2. <strong>EXCLUSÕES:</strong> A garantia NÃO cobre danos causados por mau uso, quedas, contato com líquidos (mesmo em aparelhos com resistência IP68), tela quebrada, oxidação ou instalações de software não oficiais (Jailbreak/Beta).</p>
             <p>3. <strong>BATERIA:</strong> Por se tratar de um item consumível, a garantia cobre apenas se a bateria apresentar falha crítica ou degradar mais de 10% no período de garantia. Saúde da bateria na entrega conferida pelo cliente.</p>
             <p>4. <strong>TROCA/DEVOLUÇÃO:</strong> Em caso de defeito coberto, o prazo legal para reparo é de até 30 dias. Não havendo reparo, o cliente poderá optar pela troca ou reembolso.</p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-12 mt-20 text-black">
             <div className="text-center">
                <div className="border-t border-black pt-2">
                   <p className="font-bold uppercase">{currentSale.customer.name}</p>
                   <p className="text-[10px] uppercase">Assinatura do Cliente</p>
                </div>
             </div>
             <div className="text-center">
                <div className="border-t border-black pt-2">
                   <p className="font-bold uppercase">OUTLET STORE PLUS</p>
                   <p className="text-[10px] uppercase">Assinatura do Lojista</p>
                </div>
             </div>
          </div>

          <div className="text-center mt-12 text-[10px] text-gray-400">
             Obrigado pela preferência! Guarde este documento.
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintLayout;
