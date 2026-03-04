import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { apiClient } from "../lib/api";
import type {
  EmailSettings,
  LogoSettings,
  Setting,
  ShopSettings,
  SystemSettings,
} from "../entities/Setting";

interface SettingsState {
  // Data
  shopSettings: ShopSettings | null;
  emailSettings: EmailSettings | null;
  logoSettings: LogoSettings | null;
  systemSettings: SystemSettings | null;

  // Loading states
  isLoadingShop: boolean;
  isLoadingEmail: boolean;
  isLoadingLogo: boolean;
  isLoadingSystem: boolean;

  // Saving states
  isSavingShop: boolean;
  isSavingEmail: boolean;
  isSavingLogo: boolean;
  isSavingSystem: boolean;

  // Actions
  setSettings: (setting: Setting) => void;
  fetchShopSettings: () => Promise<void>;
  fetchEmailSettings: () => Promise<void>;
  fetchLogoSettings: () => Promise<void>;
  fetchSystemSettings: () => Promise<void>;
  fetchSettings: () => Promise<void>;
  updateShopSettings: (data: ShopSettings) => Promise<void>;
  updateEmailSettings: (data: EmailSettings) => Promise<void>;
  updateLogoSettings: (file: File) => Promise<void>;
  updateSystemSettings: (data: SystemSettings) => Promise<void>;
  testEmailConfiguration: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      shopSettings: null,
      emailSettings: null,
      logoSettings: null,
      systemSettings: null,
      isLoadingShop: false,
      isLoadingEmail: false,
      isLoadingLogo: false,
      isLoadingSystem: false,
      isSavingShop: false,
      isSavingEmail: false,
      isSavingLogo: false,
      isSavingSystem: false,

      setSettings({ shop_settings, logo_settings, email_settings, system_settings }) {
        set({
          shopSettings: shop_settings,
          emailSettings: email_settings,
          logoSettings: logo_settings,
          systemSettings: system_settings ?? null,
        });
      },
      // Fetch shop settings
      fetchShopSettings: async () => {
        set({ isLoadingShop: true });
        try {
          const response = await apiClient.get("/core/settings/shop/");
          set({ shopSettings: response.data, isLoadingShop: false });
        } catch (error) {
          set({ isLoadingShop: false });
          throw error;
        }
      },

      // Fetch email settings
      fetchEmailSettings: async () => {
        set({ isLoadingEmail: true });
        try {
          const response = await apiClient.get("/core/settings/email/");
          set({ emailSettings: response.data, isLoadingEmail: false });
        } catch (error) {
          set({ isLoadingEmail: false });
          throw error;
        }
      },

      // Fetch logo settings
      fetchLogoSettings: async () => {
        set({ isLoadingLogo: true });
        try {
          const response = await apiClient.get("/core/settings/logo/");
          set({ logoSettings: response.data, isLoadingLogo: false });
        } catch (error) {
          set({ isLoadingLogo: false });
          throw error;
        }
      },
      fetchSystemSettings: async () => {
        set({ isLoadingSystem: true });
        try {
          const response = await apiClient.get("/core/settings/system/");
          set({ systemSettings: response.data, isLoadingSystem: false });
        } catch (error) {
          set({ isLoadingSystem: false });
          throw error;
        }
      },
      async fetchSettings() {
        const {
          fetchShopSettings,
          fetchLogoSettings,
          fetchEmailSettings,
          fetchSystemSettings,
        } =
          get();
        await Promise.all([
          fetchShopSettings(),
          fetchLogoSettings(),
          fetchEmailSettings(),
          fetchSystemSettings(),
        ]);
      },

      // Update shop settings
      updateShopSettings: async (data: ShopSettings) => {
        set({ isSavingShop: true });
        try {
          const response = await apiClient.put("/core/settings/shop/", data);
          set({ shopSettings: response.data, isSavingShop: false });
        } catch (error) {
          set({ isSavingShop: false });
          throw error;
        }
      },

      // Update email settings
      updateEmailSettings: async (data: EmailSettings) => {
        set({ isSavingEmail: true });
        try {
          const response = await apiClient.put("/core/settings/email/", data);
          set({ emailSettings: response.data, isSavingEmail: false });
        } catch (error) {
          set({ isSavingEmail: false });
          throw error;
        }
      },

      // Update logo settings
      updateLogoSettings: async (file: File) => {
        set({ isSavingLogo: true });
        try {
          const formData = new FormData();
          formData.append("logo", file);

          const response = await apiClient.put(
            "/core/settings/logo/",
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            }
          );
          set({ logoSettings: response.data, isSavingLogo: false });
        } catch (error) {
          set({ isSavingLogo: false });
          throw error;
        }
      },
      updateSystemSettings: async (data: SystemSettings) => {
        set({ isSavingSystem: true });
        try {
          const response = await apiClient.put("/core/settings/system/", data);
          set({ systemSettings: response.data, isSavingSystem: false });
        } catch (error) {
          set({ isSavingSystem: false });
          throw error;
        }
      },

      // Test email configuration
      testEmailConfiguration: async () => {
        await apiClient.post("/core/settings/email/test/");
      },
    }),
    {
      name: "settings-store",
    }
  )
);
