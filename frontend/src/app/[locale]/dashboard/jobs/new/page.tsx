import { useTranslations } from 'next-intl';
import { JobCreationWizard } from '@/components/features/dashboard/job-creation-wizard';

export default function NewJobPage() {
  const t = useTranslations('JobWizard');

  return (
    <div className='flex flex-col gap-8'>
      <div className='max-w-4xl mx-auto w-full'>
        <h1 className='text-3xl font-bold tracking-tight text-white mb-2'>
          {t('title')}
        </h1>
        <p className='text-muted-foreground'>{t('description')}</p>
      </div>

      <JobCreationWizard />
    </div>
  );
}
