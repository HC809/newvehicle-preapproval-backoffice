export interface DealershipForm {
  name: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  isActive: boolean;
  managerId: string | null;
}

export type CreateDelaershipForm = Omit<DealershipForm, 'isActive'>;

export interface Dealership extends DealershipForm {
  id: string;
  isDeleted: boolean;
  managerName: string | null;
}
