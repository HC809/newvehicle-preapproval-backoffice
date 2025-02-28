export interface DealershipForm {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface Dealership extends DealershipForm {
  id: string;
}
