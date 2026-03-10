import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff, ShieldAlert, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { PageHeader } from "@/components";
import { Button, Card, CardContent, CardFooter, Checkbox, Input, Select } from "@/components/ui";
import { roles, type RoleName } from "@/data/roles";
import { useCreateUser } from "@/modules/auth/api/useUsers";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import type { CreateUserData } from "@/modules/auth/api/userManagementService";

const createUserSchema = z
  .object({
    first_name: z.string().trim().min(2, "First name must be at least 2 characters"),
    last_name: z.string().trim().min(2, "Last name must be at least 2 characters"),
    username: z.string().trim().min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Invalid email address"),
    phone: z.string().trim().optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Confirm password is required"),
    role_name: z.enum(["receptionist", "viewer", "user_creator"] as const),
    send_verification_email: z.boolean().default(false),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

type CreateUserFormData = z.infer<typeof createUserSchema>;

const creatableRoles: RoleName[] = ["receptionist", "viewer", "user_creator"];

export default function UsersAddPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const createUserMutation = useCreateUser();
  const { userProfile } = useUserStore();

  const canCreateUsers =
    userProfile?.role === "admin" ||
    userProfile?.isSuperuser === true ||
    userProfile?.role === "user_creator";

  const roleOptions = useMemo(
    () =>
      roles
        .filter((role) => creatableRoles.includes(role.name))
        .map((role) => ({ value: role.name, label: role.value })),
    []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      confirm_password: "",
      role_name: "viewer",
      send_verification_email: false,
    },
  });

  const onSubmit = async (values: CreateUserFormData) => {
    if (!canCreateUsers) {
      return;
    }
    await createUserMutation.mutateAsync(values as CreateUserData);
    navigate("/users");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add User"
        subtitle="Create a new user account and assign access role."
        actions={[
          {
            label: "Back to Users",
            icon: <ArrowLeft className="h-4 w-4" />,
            variant: "outline",
            onClick: () => navigate("/users"),
          },
        ]}
      />

      {!canCreateUsers ? (
        <Card variant="outlined">
          <CardContent className="mt-0 flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 text-warning" />
            <div>
              <p className="text-sm font-medium text-text-primary">Access required</p>
              <p className="text-sm text-text-secondary">
                You do not have permission to create user accounts.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardContent className="mt-0 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="First Name"
                placeholder="Enter first name"
                error={errors.first_name?.message}
                {...register("first_name")}
              />
              <Input
                label="Last Name"
                placeholder="Enter last name"
                error={errors.last_name?.message}
                {...register("last_name")}
              />
              <Input
                label="Username"
                placeholder="Enter username"
                error={errors.username?.message}
                {...register("username")}
              />
              <Input
                type="email"
                label="Email"
                placeholder="user@library.edu"
                error={errors.email?.message}
                {...register("email")}
              />
              <Input
                label="Phone Number"
                placeholder="+93 70 000 0000"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <Select
                label="Role"
                options={roleOptions}
                error={errors.role_name?.message}
                {...register("role_name")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="mt-0 grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter password"
                error={errors.password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-muted hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register("password")}
              />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                label="Confirm Password"
                placeholder="Confirm password"
                error={errors.confirm_password?.message}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    className="text-muted hover:text-text-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                {...register("confirm_password")}
              />
              <div className="md:col-span-2">
                <Checkbox
                  label="Send verification email"
                  description="The user will receive an email verification link."
                  {...register("send_verification_email")}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => navigate("/users")}>
                Cancel
              </Button>
              <Button
                type="submit"
                loading={createUserMutation.isPending}
                leftIcon={<UserPlus className="h-4 w-4" />}
              >
                Create User
              </Button>
            </CardFooter>
          </Card>
        </form>
      )}
    </div>
  );
}
