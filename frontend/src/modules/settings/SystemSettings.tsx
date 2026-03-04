import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { BookOpen, CalendarClock, Coins } from "lucide-react";

import { PageHeader } from "@components/index";
import { Card, CardContent, CardHeader, Button, Switch, Skeleton } from "@components/ui";
import Input from "@components/ui/Input";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { systemSettingsSchema } from "@/schemas/settingsSchema";
import type { SystemSettings as SystemSettingsType } from "@/entities/Setting";
import { extractAxiosError } from "@/utils/extractError";

export default function SystemSettings() {
  const { t } = useTranslation();
  const {
    systemSettings,
    isLoadingSystem,
    isSavingSystem,
    fetchSystemSettings,
    updateSystemSettings,
  } = useSettingsStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SystemSettingsType>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      max_books_per_member: 3,
      max_lending_days: 14,
      fine_per_day: 0,
      allow_renewal: true,
    },
  });

  useEffect(() => {
    fetchSystemSettings().catch(() => {
      // Keep local defaults if request fails.
    });
  }, [fetchSystemSettings]);

  useEffect(() => {
    if (systemSettings) {
      reset(systemSettings);
    }
  }, [systemSettings, reset]);

  const onSubmit = async (data: SystemSettingsType) => {
    try {
      await updateSystemSettings(data);
      toast.success(t("settings.systemSaved", "System settings saved successfully"));
    } catch (error) {
      toast.error(extractAxiosError(error, "Failed to save system settings"));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("mis.settings.system", "System Settings")}
        subtitle={t("mis.settings.systemSubtitle", "Control lending limits and renewal rules")}
      />

      <Card>
        <CardHeader
          title={t("settings.lendingRules", "Lending Rules")}
          subtitle={t("settings.lendingRulesSubtitle", "Global borrowing limits used across the library")}
        />
        <CardContent>
          {isLoadingSystem ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-8 w-2/3" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  type="number"
                  min={1}
                  label={t("settings.maxBooksPerMember", "Maximum Books Per Member")}
                  leftIcon={<BookOpen className="h-4 w-4" />}
                  error={errors.max_books_per_member?.message}
                  {...register("max_books_per_member", { valueAsNumber: true })}
                />

                <Input
                  type="number"
                  min={1}
                  label={t("settings.maxLendingDays", "Maximum Lending Days")}
                  leftIcon={<CalendarClock className="h-4 w-4" />}
                  error={errors.max_lending_days?.message}
                  {...register("max_lending_days", { valueAsNumber: true })}
                />

                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  label={t("settings.finePerDay", "Fine Per Day")}
                  leftIcon={<Coins className="h-4 w-4" />}
                  error={errors.fine_per_day?.message}
                  {...register("fine_per_day", { valueAsNumber: true })}
                />
              </div>

              <Switch
                label={t("settings.allowRenewal", "Allow renewals")}
                description={t(
                  "settings.allowRenewalDesc",
                  "Members can extend return dates when this is enabled"
                )}
                {...register("allow_renewal")}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={isSavingSystem}>
                  {t("common.save", "Save Changes")}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
