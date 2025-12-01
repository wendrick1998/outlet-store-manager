export const roundUpToFive = (value: number): number => {
  if (!value) return 0;
  return Math.ceil(value / 5) * 5;
};

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const calculateWarrantyEnd = (dateString: string): Date => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + 30);
  return date;
};

export const getDaysRemaining = (warrantyEndDateString: string): number => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const end = new Date(warrantyEndDateString);
  end.setHours(0,0,0,0);
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getTodayString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};