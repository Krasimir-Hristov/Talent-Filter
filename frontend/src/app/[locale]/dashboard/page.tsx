import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('Dashboard');

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-white'>
          {t('title')}
        </h1>
        <p className='text-muted-foreground'>{t('welcome')}</p>
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
        {/* Placeholder cards for future step 3.5 */}
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='h-32 rounded-xl border border-white/5 bg-white/2'
          />
        ))}
      </div>

      <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
        <div className='col-span-4 h-[400px] rounded-xl border border-white/5 bg-white/2' />
        <div className='col-span-3 h-[400px] rounded-xl border border-white/5 bg-white/2' />
      </div>
    </div>
  );
}
