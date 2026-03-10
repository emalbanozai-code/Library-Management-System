import { useUserStore } from "../stores/useUserStore";

export default function useRecordManagementAccess() {
  const userProfile = useUserStore((state) => state.userProfile);
  const canManageRecords = Boolean(
    userProfile?.isSuperuser || userProfile?.role === "admin"
  );

  return {
    canManageRecords,
  };
}
