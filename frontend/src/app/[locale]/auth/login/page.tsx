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

export default function LoginPage() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formSchema = z.object({
    email: z.string().email(t('validation.invalidEmail')),
    password: z.string().min(8, t('validation.passwordLength')),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const data = await apiFetch<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      setAuth(data.user, data.access_token);
      toast.success(t('login.success') || 'Logged in successfully');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='rounded-3xl border border-white/10 bg-white/2 backdrop-blur-2xl p-8 shadow-2xl overflow-hidden relative group'>
      {/* Subtle shine effect on hover */}
      <div className='absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none' />

      <div className='space-y-6 relative z-10'>
        <div className='space-y-2'>
          <h2 className='text-2xl font-semibold tracking-tight text-white/90'>
            {t('login.title')}
          </h2>
          <p className='text-slate-400 text-sm'>{t('login.description')}</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-5'>
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
                      placeholder='name@company.com'
                      {...field}
                      className='bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20 transition-all'
                    />
                  </FormControl>
                  <FormMessage className='text-red-400 text-xs' />
                </FormItem>
              )}
            />
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
                        className='bg-white/5 border-white/5 h-12 rounded-xl text-white placeholder:text-slate-600 focus:border-brand-accent/50 focus:ring-brand-accent/20 transition-all pr-10'
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
            <Button
              type='submit'
              disabled={isLoading}
              className='w-full h-12 rounded-xl bg-linear-to-r from-brand-accent to-brand-glow hover:opacity-90 text-white font-semibold shadow-lg shadow-brand-accent/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isLoading
                ? t('login.loading') || 'Logging in...'
                : t('login.submit')}
            </Button>
          </form>
        </Form>

        <div className='pt-2 text-center'>
          <p className='text-slate-400 text-sm'>
            {t('login.noAccount')}{' '}
            <Link
              href='/auth/register'
              className='text-brand-accent hover:underline font-medium transition-colors'
            >
              {t('login.registerLink')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
