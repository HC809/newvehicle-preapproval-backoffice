import { create } from 'zustand';
import { CompanyConfiguration } from 'types/CompanyConfigurations';

interface CompanyConfigurationStore {
  currentConfiguration: CompanyConfiguration | null;
  setCurrentConfiguration: (configuration: CompanyConfiguration | null) => void;
}

const useStore = create<CompanyConfigurationStore>((set) => ({
  currentConfiguration: null,
  setCurrentConfiguration: (configuration) =>
    set({ currentConfiguration: configuration })
}));

export const useCompanyConfigurationStore = () => {
  return useStore();
};
