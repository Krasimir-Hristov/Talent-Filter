import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/routing';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');

  return (
    <div className='flex flex-col gap-8'>
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-white mb-1'>
            {t('title')}
          </h1>
          <p className='text-muted-foreground'>{t('welcome')}</p>
        </div>
        <Button
          asChild
          className='bg-brand-accent hover:bg-brand-accent/90 text-white gap-2'
        >
          <Link href='/dashboard/jobs/new'>
            <Plus className='size-4' />
            {t('newJob')}
          </Link>
        </Button>
      </div>

      <div className='grid gap-6'>
        <h2 className='text-xl font-semibold text-white/90'>
          {t('activeJobs')}
        </h2>

        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
          <div className='col-span-full py-12 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/2'>
            <p className='text-slate-400 mb-4'>{t('noJobs')}</p>
            <Button variant='outline' asChild>
              <Link href='/dashboard/jobs/new' className='gap-2'>
                <Plus className='size-4' />
                {t('newJob')}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <div className='col-span-4 h-[400px] rounded-xl border border-white/5 bg-white/2' />
        <div className='col-span-3 h-[400px] rounded-xl border border-white/5 bg-white/2' />
      </div>
    </div>
  );
}
