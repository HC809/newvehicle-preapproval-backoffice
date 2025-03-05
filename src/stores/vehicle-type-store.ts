import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { VehicleType } from 'types/VehicleTypes';

interface VehicleTypeStore {
  vehicleTypeToEdit: VehicleType | null;
  setVehicleTypeToEdit: (vehicleType: VehicleType | null) => void;
}

let store: ReturnType<typeof createStore>;

function createStore() {
  return create<VehicleTypeStore>()(
    devtools(
      (set) => ({
        vehicleTypeToEdit: null,
        setVehicleTypeToEdit: (vehicleType) =>
          set(
            { vehicleTypeToEdit: vehicleType },
            false,
            'vehicleType/setVehicleTypeToEdit'
          )
      }),
      {
        name: 'VehicleType Store',
        enabled: process.env.NODE_ENV === 'development'
      }
    )
  );
}

export const useVehicleTypeStore = () => {
  if (!store) {
    store = createStore();
  }
  return store();
};
