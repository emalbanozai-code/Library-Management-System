import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Card, CardContent, Input, Select, Switch, Textarea } from '@/components/ui';

import { customerFormSchema } from '../schemas/customerSchema';
import type { CustomerFormValues } from '../types/customer';

interface CustomerFormProps {
  initialValues?: Partial<CustomerFormValues> & { photo_url?: string | null };
  onSubmit: (values: CustomerFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
}

const defaultValues: CustomerFormValues = {
  first_name: '',
  last_name: '',
  photo: undefined,
  phone: '',
  email: '',
  address: '',
  gender: 'other',
  total_purchases: 0,
  discount_percent: 0,
  is_active: true,
};

export default function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      first_name: initialValues.first_name || '',
      last_name: initialValues.last_name || '',
      photo: undefined,
      phone: initialValues.phone || '',
      email: initialValues.email || '',
      address: initialValues.address || '',
      gender: initialValues.gender || 'other',
      total_purchases: initialValues.total_purchases ?? 0,
      discount_percent: initialValues.discount_percent ?? 0,
      is_active: initialValues.is_active ?? true,
    });
  }, [initialValues, reset]);

  const selectedPhoto = watch('photo');
  const photoPreview = useMemo(() => {
    if (!(selectedPhoto instanceof File)) {
      return null;
    }
    return URL.createObjectURL(selectedPhoto);
  }, [selectedPhoto]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const currentPhotoUrl =
    photoPreview || (selectedPhoto === null ? null : (initialValues?.photo_url ?? null));

  const submit = async (values: CustomerFormValues) => {
    await onSubmit(values);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="First Name"
              placeholder="First name"
              {...register('first_name')}
              error={errors.first_name?.message}
            />
            <Input
              label="Last Name"
              placeholder="Last name"
              {...register('last_name')}
              error={errors.last_name?.message}
            />
            <Input label="Phone" placeholder="Phone number" {...register('phone')} error={errors.phone?.message} />
            <Input label="Email" placeholder="Email address" {...register('email')} error={errors.email?.message} />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  label="Gender"
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ]}
                  value={field.value}
                  onChange={(event) => field.onChange(event.target.value)}
                  error={errors.gender?.message}
                />
              )}
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              label="Total Purchases"
              placeholder="0.00"
              {...register('total_purchases', { valueAsNumber: true })}
              error={errors.total_purchases?.message}
            />
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              label="Discount Percent"
              placeholder="0.00"
              {...register('discount_percent', { valueAsNumber: true })}
              error={errors.discount_percent?.message}
            />
            <div className="mt-7">
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Switch
                    label="Active"
                    checked={field.value}
                    onChange={(event) => field.onChange(event.target.checked)}
                  />
                )}
              />
            </div>
          </div>

          <Textarea
            label="Address"
            placeholder="Customer address"
            rows={3}
            {...register('address')}
            error={errors.address?.message}
          />

          <Controller
            name="photo"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  label="Photo"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    field.onChange(file || undefined);
                  }}
                />

                {currentPhotoUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={currentPhotoUrl}
                      alt="Customer"
                      className="h-20 w-20 rounded-lg border border-border object-cover"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setValue('photo', null, { shouldDirty: true })}
                    >
                      Remove Photo
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">No photo selected</p>
                )}
              </div>
            )}
          />

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

