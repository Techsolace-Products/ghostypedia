'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema, type RegisterFormData } from '@/lib/validation/auth.schemas';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ApiError } from '@/types/auth';

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const [apiError, setApiError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError('');
    try {
      await registerUser({
        email: data.email,
        username: data.username,
        password: data.password,
      });
    } catch (error) {
      const apiErr = error as ApiError;
      setApiError(apiErr.message || 'Registration failed. Please try again.');
    }
  };

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

      <Input
        {...register('username')}
        type="text"
        label="Username"
        placeholder="ghosthunter"
        error={errors.username?.message}
        autoComplete="username"
      />

      <Input
        {...register('password')}
        type="password"
        label="Password"
        placeholder="••••••••"
        error={errors.password?.message}
        autoComplete="new-password"
      />

      <Input
        {...register('confirmPassword')}
        type="password"
        label="Confirm Password"
        placeholder="••••••••"
        error={errors.confirmPassword?.message}
        autoComplete="new-password"
      />

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      <Button type="submit" isLoading={isSubmitting} className="w-full">
        Create Account
      </Button>
    </form>
  );
}
