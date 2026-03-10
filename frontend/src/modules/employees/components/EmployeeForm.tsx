import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button, Card, CardContent, Checkbox, FileUpload, Input, Select, Textarea } from '@/components/ui';

import { getEmployeeFormSchema } from '../schemas/employeeSchema';
import type { EmployeeFormValues } from '../types/employee';
import {
  employeeGenderOptions,
  employeeMembershipOptions,
  employeePositionOptions,
  employeeStatusOptions,
  weekdayOptions,
} from '../types/employee';

interface EmployeeFormProps {
  initialValues?: Partial<EmployeeFormValues>;
  onSubmit: (values: EmployeeFormValues) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  requirePassword?: boolean;
}

const defaultValues: EmployeeFormValues = {
  first_name: '',
  last_name: '',
  father_name: '',
  date_of_birth: '',
  gender: '',
  address: '',
  phone: '',
  email: '',
  salary: 0,
  work_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  join_date: '',
  membership_type: 'permanent',
  position: 'receptionist',
  status: 'active',
  username: '',
  picture: undefined,
  password: '',
};

export default function EmployeeForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save',
  requirePassword = true,
}: EmployeeFormProps) {
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(getEmployeeFormSchema(requirePassword)),
    defaultValues,
  });

  const watchedPicture = watch('picture');

  useEffect(() => {
    if (watchedPicture instanceof File) {
      const objectUrl = URL.createObjectURL(watchedPicture);
      setPicturePreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else if (initialValues?.picture && typeof initialValues.picture === 'string') {
      setPicturePreview(initialValues.picture);
    } else {
      setPicturePreview(null);
    }
  }, [watchedPicture, initialValues?.picture]);

  useEffect(() => {
    if (!initialValues) {
      reset(defaultValues);
      return;
    }

    reset({
      ...defaultValues,
      ...initialValues,
      password: '',
      picture: initialValues.picture || undefined,
    });
  }, [initialValues, reset]);

  const submit = async (values: EmployeeFormValues) => {
    const normalized: EmployeeFormValues = {
      ...values,
      password: values.password?.trim() || undefined,
      gender: values.gender || '',
    };
    await onSubmit(normalized);
  };

  return (
    <Card>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="First Name" {...register('first_name')} error={errors.first_name?.message} />
            <Input label="Last Name" {...register('last_name')} error={errors.last_name?.message} />
            <Input label="Father Name" {...register('father_name')} error={errors.father_name?.message} />
            <Input
              type="date"
              label="Date of Birth"
              {...register('date_of_birth')}
              error={errors.date_of_birth?.message}
            />
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select
                  label="Gender"
                  placeholder="Select gender"
                  value={field.value}
                  options={employeeGenderOptions}
                  onChange={(event) => field.onChange(event.target.value as EmployeeFormValues['gender'])}
                  error={errors.gender?.message}
                />
              )}
            />
            <Input label="Phone" {...register('phone')} error={errors.phone?.message} />
            <Input type="email" label="Email" {...register('email')} error={errors.email?.message} />
            <Input label="Username" {...register('username')} error={errors.username?.message} />
            <Input
              type="password"
              label={requirePassword ? 'Password' : 'Password (Optional)'}
              placeholder={requirePassword ? '' : 'Leave blank to keep existing password'}
              {...register('password')}
              error={errors.password?.message}
            />
            <Input
              type="number"
              min="0"
              step="0.01"
              label="Salary"
              {...register('salary', { valueAsNumber: true })}
              error={errors.salary?.message}
            />
            <Input
              type="date"
              label="Join Date"
              {...register('join_date')}
              error={errors.join_date?.message}
            />
            <Controller
              name="membership_type"
              control={control}
              render={({ field }) => (
                <Select
                  label="Membership Type"
                  value={field.value}
                  options={employeeMembershipOptions}
                  onChange={(event) =>
                    field.onChange(event.target.value as EmployeeFormValues['membership_type'])
                  }
                  error={errors.membership_type?.message}
                />
              )}
            />
            <Controller
              name="position"
              control={control}
              render={({ field }) => (
                <Select
                  label="Position"
                  value={field.value}
                  options={employeePositionOptions}
                  onChange={(event) => field.onChange(event.target.value as EmployeeFormValues['position'])}
                  error={errors.position?.message}
                />
              )}
            />
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  label="Status"
                  value={field.value}
                  options={employeeStatusOptions}
                  onChange={(event) => field.onChange(event.target.value as EmployeeFormValues['status'])}
                  error={errors.status?.message}
                />
              )}
            />
          </div>

          <Textarea label="Address" rows={3} {...register('address')} error={errors.address?.message} />

          <Controller
            name="work_days"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">Work Days</p>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {weekdayOptions.map((day) => {
                    const checked = field.value.includes(day.value);
                    return (
                      <Checkbox
                        key={day.value}
                        label={day.label}
                        checked={checked}
                        onChange={(event) => {
                          const isChecked = event.target.checked;
                          const next = isChecked
                            ? Array.from(new Set([...field.value, day.value]))
                            : field.value.filter((item) => item !== day.value);
                          field.onChange(next);
                        }}
                      />
                    );
                  })}
                </div>
                {errors.work_days?.message ? (
                  <p className="text-sm text-error">{errors.work_days.message}</p>
                ) : null}
              </div>
            )}
          />

          <Controller
            name="picture"
            control={control}
            render={({ field: { onChange, value } }) => (
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-primary">Profile Picture</p>
                <div className="flex items-start gap-4">
                  {picturePreview && (
                    <div className="flex-shrink-0">
                      <img
                        src={picturePreview}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border-2 border-border"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <FileUpload
                      accept="image/*"
                      onFilesChange={(files) => {
                        const file = files[0];
                        if (file) {
                          onChange(file);
                        }
                      }}
                      description="Upload a profile picture (JPG, PNG)"
                      maxSize={5 * 1024 * 1024}
                    />
                    {value && (
                      <button
                        type="button"
                        onClick={() => {
                          onChange(undefined);
                          setPicturePreview(null);
                        }}
                        className="mt-2 text-sm text-error hover:underline"
                      >
                        Remove picture
                      </button>
                    )}
                  </div>
                </div>
                {errors.picture?.message && (
                  <p className="text-sm text-error">{errors.picture.message}</p>
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
