import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/admin/primitives/button';
import { Input } from '@/components/admin/primitives/input';
import { Field, FieldLabel, FieldError } from '@/components/admin/primitives/field';
import { useAdminAuth } from '@/components/admin/auth/useAdminAuth';
import { loginSchema, type LoginInput } from '@/components/admin/auth/loginSchema';
import { adminLoginCopy } from '@/content/adminAuth';

export const LoginPage = (): ReactNode => {
  const { signIn } = useAdminAuth();
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
    <div className="admin-shell flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        className="w-full max-w-sm space-y-4"
      >
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
    </div>
  );
};
