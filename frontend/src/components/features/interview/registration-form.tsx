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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  UserPlus,
  Mail,
  Phone,
  User,
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

  // Dynamic Zod schema with localized error messages
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

      // Success! Redirect to the interview session
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
    <Card className='w-full max-w-lg border-primary/20 bg-background/60 backdrop-blur-xl shadow-2xl'>
      <CardHeader className='text-center pb-4'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          <Badge
            variant='outline'
            className='text-primary border-primary/30 uppercase tracking-widest text-[10px]'
          >
            {t('apply.badge')}
          </Badge>
        </div>
        <CardTitle className='text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70'>
          {jobTitle}
        </CardTitle>
        <CardDescription className='text-muted-foreground mt-2'>
          {t('apply.description')}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className='space-y-5'>
          {/* Server Error Banner */}
          {serverError && (
            <div className='flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300'>
              <AlertCircle size={18} className='shrink-0 mt-0.5' />
              <p>{serverError}</p>
            </div>
          )}

          {/* Name Fields — Side by side */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label
                htmlFor='first_name'
                className='text-sm font-medium flex items-center gap-1.5'
              >
                <User size={14} className='text-muted-foreground' />
                {t('apply.firstName')}
              </Label>
              <Input
                id='first_name'
                placeholder={t('apply.firstNamePlaceholder')}
                {...register('first_name')}
                className={
                  errors.first_name
                    ? 'border-destructive focus-visible:ring-destructive/30'
                    : ''
                }
              />
              {errors.first_name && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label
                htmlFor='last_name'
                className='text-sm font-medium flex items-center gap-1.5'
              >
                <User size={14} className='text-muted-foreground' />
                {t('apply.lastName')}
              </Label>
              <Input
                id='last_name'
                placeholder={t('apply.lastNamePlaceholder')}
                {...register('last_name')}
                className={
                  errors.last_name
                    ? 'border-destructive focus-visible:ring-destructive/30'
                    : ''
                }
              />
              {errors.last_name && (
                <p className='text-xs text-destructive mt-1'>
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className='space-y-2'>
            <Label
              htmlFor='email'
              className='text-sm font-medium flex items-center gap-1.5'
            >
              <Mail size={14} className='text-muted-foreground' />
              {t('apply.email')}
            </Label>
            <Input
              id='email'
              type='email'
              placeholder={t('apply.emailPlaceholder')}
              {...register('email')}
              className={
                errors.email
                  ? 'border-destructive focus-visible:ring-destructive/30'
                  : ''
              }
            />
            {errors.email && (
              <p className='text-xs text-destructive mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone (Optional) */}
          <div className='space-y-2'>
            <Label
              htmlFor='phone'
              className='text-sm font-medium flex items-center gap-1.5'
            >
              <Phone size={14} className='text-muted-foreground' />
              {t('apply.phone')}
              <span className='text-xs text-muted-foreground font-normal ml-1'>
                ({t('apply.optional')})
              </span>
            </Label>
            <Input
              id='phone'
              type='tel'
              placeholder={t('apply.phonePlaceholder')}
              {...register('phone')}
            />
          </div>
        </CardContent>

        <CardFooter className='flex flex-col gap-4 pt-6 border-t border-border/50 bg-muted/30'>
          <p className='text-[10px] text-muted-foreground text-center italic'>
            {t('apply.consent')}
          </p>
          <Button
            type='submit'
            size='lg'
            disabled={isSubmitting}
            className='w-full text-lg font-semibold group h-14 bg-primary hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.3)]'
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                {t('apply.submitting')}
              </>
            ) : (
              <>
                <UserPlus className='mr-2 h-5 w-5' />
                {t('apply.submit')}
                <ArrowRight className='ml-2 group-hover:translate-x-1 transition-transform' />
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
