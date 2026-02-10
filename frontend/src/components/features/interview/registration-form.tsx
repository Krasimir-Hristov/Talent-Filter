'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { startInterviewSession } from '@/lib/interview-api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Mail,
  Phone,
  User,
  Sparkles,
} from 'lucide-react';

interface RegistrationFormProps {
  jobId: string;
  jobTitle: string;
  locale: string;
}

export function RegistrationForm({
  jobId,
  jobTitle,
  locale,
}: RegistrationFormProps) {
  const t = useTranslations('Interview');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const registrationSchema = z.object({
    first_name: z.string().min(1, t('apply.validation.firstNameRequired')),
    last_name: z.string().min(1, t('apply.validation.lastNameRequired')),
    email: z
      .string()
      .min(1, t('apply.validation.emailRequired'))
      .email(t('apply.validation.invalidEmail')),
    phone: z.string().optional(),
  });

  type RegistrationFormData = z.infer<typeof registrationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setServerError(null);

    try {
      const session = await startInterviewSession({
        job_id: jobId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone!,
      });

      router.push(
        `/${locale}/interview/${jobId}/session?sid=${session.interview_id}`,
      );
    } catch (error: any) {
      if (error.status === 409) {
        setServerError(t('apply.errors.alreadyApplied'));
      } else if (error.status === 404) {
        setServerError(t('apply.errors.jobClosed'));
      } else if (error.status === 429) {
        setServerError(t('apply.errors.tooManyRequests'));
      } else {
        setServerError(t('apply.errors.generic'));
      }
    }
  };

  return (
    <Card className='w-full max-w-2xl rounded-4xl bg-white/2 border border-white/5 backdrop-blur-3xl shadow-2xl p-4 md:p-8 animate-in fade-in zoom-in-95 duration-700'>
      <CardHeader className='text-center space-y-6 pb-8'>
        <div className='flex justify-center'>
          <Badge
            variant='outline'
            className='px-4 py-1.5 border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-[0.2em] font-bold rounded-full'
          >
            {t('apply.badge')}
          </Badge>
        </div>

        <div className='space-y-4'>
          <CardTitle className='text-4xl md:text-5xl font-black tracking-tight text-white leading-tight'>
            {jobTitle}
          </CardTitle>
          <div className='h-1 w-12 bg-primary/40 rounded-full mx-auto' />
          <CardDescription className='text-lg md:text-xl text-slate-400 font-medium'>
            {t('apply.description')}
          </CardDescription>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className='space-y-10'>
        <CardContent className='space-y-8'>
          {serverError && (
            <div className='flex items-center gap-3 p-5 rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive font-medium animate-in fade-in slide-in-from-top-2'>
              <AlertCircle size={20} className='shrink-0' />
              <p>{serverError}</p>
            </div>
          )}

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='space-y-3'>
              <Label
                htmlFor='first_name'
                className='text-xs font-black uppercase tracking-widest text-slate-500 pl-1 flex items-center gap-2'
              >
                <User size={14} className='text-primary/60' />
                {t('apply.firstName')}
              </Label>
              <Input
                id='first_name'
                placeholder={t('apply.firstNamePlaceholder')}
                {...register('first_name')}
                className={`h-14 px-5 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all ${
                  errors.first_name
                    ? 'border-destructive/50 ring-destructive/10'
                    : ''
                }`}
              />
              {errors.first_name && (
                <p className='text-xs text-destructive font-semibold pl-1'>
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className='space-y-3'>
              <Label
                htmlFor='last_name'
                className='text-xs font-black uppercase tracking-widest text-slate-500 pl-1 flex items-center gap-2'
              >
                <User size={14} className='text-primary/60' />
                {t('apply.lastName')}
              </Label>
              <Input
                id='last_name'
                placeholder={t('apply.lastNamePlaceholder')}
                {...register('last_name')}
                className={`h-14 px-5 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all ${
                  errors.last_name
                    ? 'border-destructive/50 ring-destructive/10'
                    : ''
                }`}
              />
              {errors.last_name && (
                <p className='text-xs text-destructive font-semibold pl-1'>
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className='space-y-3'>
            <Label
              htmlFor='email'
              className='text-xs font-black uppercase tracking-widest text-slate-500 pl-1 flex items-center gap-2'
            >
              <Mail size={14} className='text-primary/60' />
              {t('apply.email')}
            </Label>
            <Input
              id='email'
              type='email'
              placeholder={t('apply.emailPlaceholder')}
              {...register('email')}
              className={`h-14 px-5 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all ${
                errors.email ? 'border-destructive/50 ring-destructive/10' : ''
              }`}
            />
            {errors.email && (
              <p className='text-xs text-destructive font-semibold pl-1'>
                {errors.email.message}
              </p>
            )}
          </div>

          <div className='space-y-3'>
            <Label
              htmlFor='phone'
              className='text-xs font-black uppercase tracking-widest text-slate-500 pl-1 flex items-center gap-2'
            >
              <Phone size={14} className='text-primary/60' />
              {t('apply.phone')}
              <span className='lowercase font-normal opacity-50 italic'>
                ({t('apply.optional')})
              </span>
            </Label>
            <Input
              id='phone'
              type='tel'
              placeholder={t('apply.phonePlaceholder')}
              {...register('phone')}
              className='h-14 px-5 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:ring-primary/20 transition-all'
            />
          </div>
        </CardContent>

        <div className='flex flex-col items-center gap-10 pt-4'>
          <p className='text-[10px] text-slate-500 text-center uppercase tracking-widest font-black leading-relaxed max-w-sm'>
            {t('apply.consent')}
          </p>

          <Button
            type='submit'
            size='lg'
            disabled={isSubmitting}
            className='w-full h-16 text-xl font-black bg-primary hover:bg-primary/90 text-white rounded-full shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group'
          >
            {isSubmitting ? (
              <div className='flex items-center gap-3'>
                <Loader2 className='h-6 w-6 animate-spin' />
                <span>{t('apply.submitting')}</span>
              </div>
            ) : (
              <div className='flex items-center gap-3'>
                <Sparkles className='h-6 w-6 text-white/50 group-hover:text-white transition-colors' />
                <span>{t('apply.submit')}</span>
                <ArrowRight className='h-6 w-6 group-hover:translate-x-2 transition-transform' />
              </div>
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
