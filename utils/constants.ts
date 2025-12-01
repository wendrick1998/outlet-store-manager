import { UserPermissions } from '../types';

export const DEFAULT_ADMIN_PERMISSIONS: UserPermissions = {
  canManageInventory: true,
  canViewDashboard: true,
  canManageTeam: true,
  canAccessCalculator: true,
  canManageSuppliers: true
};

export const DEFAULT_MANAGER_PERMISSIONS: UserPermissions = {
  canManageInventory: true,
  canViewDashboard: true,
  canManageTeam: false,
  canAccessCalculator: true,
  canManageSuppliers: true
};

export const DEFAULT_SELLER_PERMISSIONS: UserPermissions = {
  canManageInventory: false, // Só vende, não lança entrada
  canViewDashboard: false,   // Não vê lucro
  canManageTeam: false,
  canAccessCalculator: true, // Pode simular parcelas
  canManageSuppliers: false
};
