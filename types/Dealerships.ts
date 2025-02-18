export interface DealershipForm {
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
}

export interface Dealership extends DealershipForm {
  id: string;
}
