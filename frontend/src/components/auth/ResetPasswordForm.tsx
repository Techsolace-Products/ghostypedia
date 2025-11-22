'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authApi } from '@/lib/api/auth';
import { passwordResetRequestSchema, type PasswordResetRequestFormData } from '@/lib/validation/auth.schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ApiError } from '@/types/auth';

export function ResetPasswordForm() {
  const [apiError, setApiError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordResetRequestFormData>({
    resolver: zodResolver(passwordResetRequestSchema),
  });

  const onSubmit = async (data: PasswordResetRequestFormData) => {
    setApiError('');
    setSuccess(false);
    try {
      await authApi.requestPasswordReset(data.email);
      setSuccess(true);
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr.message || 'Failed to send reset email. Please try again.');
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-600">
          Password reset instructions have been sent to your email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('email')}
        type="email"
        label="Email"
        placeholder="ghost@example.com"
        error={errors.email?.message}
        autoComplete="email"
      />

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Send Reset Link
      </Button>
    </form>
  );
}
