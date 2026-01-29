'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/useAuthStore';
import { apiFetch } from '@/lib/api';
import { AuthResponse } from '@/types/auth';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z
    .object({
      fullName: z.string().min(2, t('validation.required')),
      email: z.string().email(t('validation.invalidEmail')),
      companyName: z.string().min(2, t('validation.required')),
      password: z.string().min(8, t('validation.passwordLength')),
      confirmPassword: z.string().min(1, t('validation.required')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      companyName: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const payload = {
        email: values.email,
        password: values.password,
        full_name: values.fullName,
        company_name: values.companyName,
      };

      const data = await apiFetch<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setAuth(data.user, data.access_token);
      toast.success(t('register.success') || 'Account created successfully');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='rounded-3xl border border-white/10 bg-white/2 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden relative group'>
      <div className='absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none' />

      <div className='space-y-6 relative z-10'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold tracking-tight text-white/90'>
            {t('register.title')}
          </h2>
          <p className='text-slate-400 text-sm'>{t('register.description')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='fullName'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-300 text-xs font-medium uppercase tracking-wider'>
                    {t('fields.fullName')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Jane Doe'
                      {...field}
                      className='bg-white/5 border-white/5 h-11 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20 transition-all'
                    />
                  </FormControl>
                  <FormMessage className='text-red-400 text-xs' />
                </FormItem>
              )}
            />
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-300 text-xs font-medium uppercase tracking-wider'>
                      {t('fields.email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='jane@company.com'
                        {...field}
                        className='bg-white/5 border-white/5 h-11 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20 transition-all'
                      />
                    </FormControl>
                    <FormMessage className='text-red-400 text-xs' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='companyName'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='text-slate-300 text-xs font-medium uppercase tracking-wider'>
                      {t('fields.companyName')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Talent Corp'
                        {...field}
                        className='bg-white/5 border-white/5 h-11 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20 transition-all'
                      />
                    </FormControl>
                    <FormMessage className='text-red-400 text-xs' />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-300 text-xs font-medium uppercase tracking-wider'>
                    {t('fields.password')}
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        {...field}
                        className='bg-white/5 border-white/5 h-11 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20 transition-all pr-10'
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors'
                      >
                        {showPassword ? (
                          <EyeOff className='size-4' />
                        ) : (
                          <Eye className='size-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-red-400 text-xs' />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirmPassword'
              render={({ field }) => (
                <FormItem>
                  <FormLabel className='text-slate-300 text-xs font-medium uppercase tracking-wider'>
                    {t('fields.repeatPassword')}
                  </FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder='••••••••'
                        {...field}
                        className='bg-white/5 border-white/5 h-11 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20 transition-all pr-10'
                      />
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors'
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='size-4' />
                        ) : (
                          <Eye className='size-4' />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className='text-red-400 text-xs' />
                </FormItem>
              )}
            />
            <Button
              type='submit'
              disabled={isLoading}
              className='w-full h-12 rounded-xl bg-linear-to-r from-brand-accent to-brand-glow hover:opacity-90 text-white font-semibold shadow-lg shadow-brand-accent/20 transition-all active:scale-[0.98] mt-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading
                ? t('register.loading') || 'Creating account...'
                : t('register.submit')}
            </Button>
          </form>
        </Form>

        <div className='pt-2 text-center'>
          <p className='text-slate-400 text-sm'>
            {t('register.hasAccount')}{' '}
            <Link
              href='/auth/login'
              className='text-brand-accent hover:underline font-medium transition-colors'
            >
              {t('register.loginLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
