export interface VehicleTypeForm {
  name: string;
  maxLoanTermMonths: number;
  isActive: boolean;
}

export type CreateVehicleTypeForm = Omit<VehicleTypeForm, 'isActive'>;

export interface VehicleType extends VehicleTypeForm {
  id: string;
}
