'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Eye, EyeOff } from 'lucide-react';

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
  const [showPassword, setShowPassword] = useState(false);

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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    // Logic will be added in Step 3.6
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
              className='w-full h-12 rounded-xl bg-linear-to-r from-brand-accent to-brand-glow hover:opacity-90 text-white font-semibold shadow-lg shadow-brand-accent/20 transition-all active:scale-[0.98]'
            >
              {t('login.submit')}
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
