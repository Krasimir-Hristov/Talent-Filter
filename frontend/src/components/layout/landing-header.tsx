'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link, usePathname, useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, LogIn, LayoutDashboard, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { deleteSession } from '@/lib/auth-actions';

export function LandingHeader() {
  const { isAuthenticated, logout } = useAuthStore();
  const t = useTranslations('Landing');
  const tCommon = useTranslations('Sidebar'); // Reusing "TalentFilter" title
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const locales = {
    en: { name: 'English', code: 'EN' },
    de: { name: 'Deutsch', code: 'DE' },
  };

  const currentLocale = locales[locale as keyof typeof locales] || locales.en;

  const switchLocale = (locale: 'en' | 'de') => {
    router.replace(pathname, { locale });
  };

  return (
    <header className='fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#0f172a]/80 px-6 backdrop-blur-xl'>
      {/* Logo */}
      <Link href='/' className='flex items-center gap-2'>
        <div className='flex size-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-accent to-brand-glow text-white shadow-lg shadow-brand-accent/20'>
          <span className='font-bold'>TF</span>
        </div>
        <span className='hidden font-bold tracking-tight text-white sm:inline-block'>
          {tCommon('title')}
        </span>
      </Link>

      {/* Actions */}
      <div className='flex items-center gap-4'>
        {/* Language Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='sm'
              className='h-9 px-3 gap-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-white transition-all border border-white/5'
            >
              <span className='text-xs font-bold tracking-wider'>
                {currentLocale.code}
              </span>
              <Globe className='size-3.5 opacity-50' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align='end'
            className='w-32 bg-[#1e293b] border-white/10 text-white'
          >
            <DropdownMenuItem
              onClick={() => switchLocale('en')}
              className='cursor-pointer focus:bg-white/5 focus:text-white'
            >
              English
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => switchLocale('de')}
              className='cursor-pointer focus:bg-white/5 focus:text-white'
            >
              Deutsch
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className='h-6 w-px bg-white/10' />

        {isAuthenticated ? (
          <div className='flex items-center gap-2'>
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='text-slate-300 hover:bg-white/5 hover:text-white'
            >
              <Link href='/dashboard'>
                <LayoutDashboard className='mr-2 size-4' />
                Dashboard
              </Link>
            </Button>
            <Button
              onClick={async () => {
                await deleteSession();
                logout();
              }}
              variant='ghost'
              size='sm'
              className='text-red-400 hover:bg-red-400/10 hover:text-red-400'
            >
              <LogOut className='mr-2 size-4' />
              {tCommon('logout')}
            </Button>
          </div>
        ) : (
          <Button
            asChild
            variant='ghost'
            size='sm'
            className='text-slate-300 hover:bg-white/5 hover:text-white'
          >
            <Link href='/auth/login'>
              <LogIn className='mr-2 size-4' />
              {t('recruiterLogin')}
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}
