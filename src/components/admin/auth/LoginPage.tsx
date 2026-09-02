import { useState, type FormEventHandler, type ReactNode } from 'react';
import { useForm, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/admin/primitives/button';
import { Input } from '@/components/admin/primitives/input';
import { Field, FieldLabel, FieldError } from '@/components/admin/primitives/field';
import { useAdminAuth } from '@/components/admin/auth/useAdminAuth';
import { useAdminTheme } from '@/components/admin/useAdminTheme';
import { loginSchema, type LoginInput } from '@/components/admin/auth/loginSchema';
import { adminLoginCopy } from '@/content/adminAuth';
import { cn } from '@/lib/utils';

interface LoginFormProps {
  register: UseFormRegister<LoginInput>;
  errors: FieldErrors<LoginInput>;
  isSubmitting: boolean;
  formError: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
}

const LoginForm = ({
  register,
  errors,
  isSubmitting,
  formError,
  onSubmit,
}: LoginFormProps): ReactNode => (
  <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4">
    <h1 className="text-lg font-semibold">{adminLoginCopy.title}</h1>

    <Field data-invalid={errors.email !== undefined}>
      <FieldLabel htmlFor="admin-email">{adminLoginCopy.emailLabel}</FieldLabel>
      <Input id="admin-email" type="email" autoComplete="username" {...register('email')} />
      {errors.email !== undefined && <FieldError>{errors.email.message}</FieldError>}
    </Field>

    <Field data-invalid={errors.password !== undefined}>
      <FieldLabel htmlFor="admin-password">{adminLoginCopy.passwordLabel}</FieldLabel>
      <Input
        id="admin-password"
        type="password"
        autoComplete="current-password"
        {...register('password')}
      />
      {errors.password !== undefined && <FieldError>{errors.password.message}</FieldError>}
    </Field>

    {formError !== null && <FieldError>{formError}</FieldError>}

    <Button type="submit" disabled={isSubmitting} className="w-full">
      {isSubmitting ? adminLoginCopy.submitting : adminLoginCopy.submit}
    </Button>
  </form>
);

export const LoginPage = (): ReactNode => {
  const { signIn } = useAdminAuth();
  const { theme } = useAdminTheme();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    setFormError(null);

    try {
      await signIn(email, password);
    } catch {
      setFormError(adminLoginCopy.genericError);
    }
  });

  return (
    <div
      className={cn(
        'admin-shell flex min-h-dvh items-center justify-center px-4',
        theme === 'dark' && 'dark',
      )}
    >
      <LoginForm
        register={register}
        errors={errors}
        isSubmitting={isSubmitting}
        formError={formError}
        onSubmit={(event) => {
          void onSubmit(event);
        }}
      />
    </div>
  );
};
