import { supabase } from './supabaseClient';
import { InventoryItem, Customer, Sale, User, Supplier, ShoppingItem, SaleItem, SalePayment } from '../types';

/**
 * SERVIÇO DE API SUPABASE (Camada de Dados)
 * 
 * Este arquivo contém todas as funções necessárias para operar o sistema usando o Supabase.
 * Para ativar, você precisará:
 * 1. Criar as tabelas no Supabase (Inventory, Customers, Sales, Users, Suppliers, ShoppingList).
 * 2. Substituir as chamadas de 'localStorage' no App.tsx por estas funções.
 */

export const api = {
  // --- ESTOQUE (INVENTORY) ---
  inventory: {
    async getAll() {
      const { data, error } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data as InventoryItem[];
    },
    async create(item: InventoryItem) {
      const { data, error } = await supabase.from('inventory').insert(item).select().single();
      if (error) throw error;
      return data as InventoryItem;
    },
    async update(item: InventoryItem) {
      const { error } = await supabase.from('inventory').update(item).eq('id', item.id);
      if (error) throw error;
    },
    async delete(id: number) {
      const { error } = await supabase.from('inventory').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- CLIENTES (CUSTOMERS) ---
  customers: {
    async getAll() {
      const { data, error } = await supabase.from('customers').select('*');
      if (error) throw error;
      return data as Customer[];
    },
    async create(customer: Customer) {
      const { data, error } = await supabase.from('customers').insert(customer).select().single();
      if (error) throw error;
      return data as Customer;
    }
  },

  // --- VENDAS (SALES) ---
  sales: {
    async getAll() {
      // Nota: No Supabase ideal, items e payments seriam tabelas separadas.
      // Aqui assumimos que você pode salvar JSONB ou fazer joins.
      const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false });
      if (error) throw error;
      return data as Sale[];
    },
    async create(sale: Sale) {
      // 1. Salva a venda principal
      const { data: saleData, error: saleError } = await supabase.from('sales').insert({
        id: sale.id,
        date: sale.date,
        customerId: sale.customerId,
        customerName: sale.customerName,
        totalPrice: sale.totalPrice,
        soldByUserId: sale.soldByUserId,
        soldByUserName: sale.soldByUserName
      }).select().single();
      
      if (saleError) throw saleError;

      // 2. (Opcional) Salva Itens e Pagamentos se estiverem normalizados em tabelas
      // await supabase.from('sale_items').insert(sale.items.map(i => ({ ...i, sale_id: sale.id })));
      // await supabase.from('sale_payments').insert(sale.payments.map(p => ({ ...p, sale_id: sale.id })));

      return saleData;
    }
  },

  // --- FORNECEDORES (SUPPLIERS) ---
  suppliers: {
    async getAll() {
      const { data, error } = await supabase.from('suppliers').select('*');
      if (error) throw error;
      return data as Supplier[];
    },
    async create(supplier: Supplier) {
      const { error } = await supabase.from('suppliers').insert(supplier);
      if (error) throw error;
    },
    async delete(id: string) {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      if (error) throw error;
    }
  },

  // --- LISTA DE COMPRAS (SHOPPING) ---
  shopping: {
    async getAll() {
      const { data, error } = await supabase.from('shopping_list').select('*');
      if (error) throw error;
      return data as ShoppingItem[];
    },
    async create(item: ShoppingItem) {
      const { error } = await supabase.from('shopping_list').insert(item);
      if (error) throw error;
    },
    async updateStatus(id: string, status: 'pending' | 'buying' | 'bought') {
      const { error } = await supabase.from('shopping_list').update({ status }).eq('id', id);
      if (error) throw error;
    }
  }
};
