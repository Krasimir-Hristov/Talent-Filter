'use client';

import { Link, usePathname, useRouter } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Settings,
  LogOut,
  ChevronUp,
  User2,
  Sparkles,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { deleteSession } from '@/lib/auth-actions';

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('Sidebar');
  const { user, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Sidebar collapsible='icon' className='border-r border-white/5' />;
  }

  const items = [
    {
      title: t('overview'),
      url: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      title: t('jobs'),
      url: '/dashboard/jobs',
      icon: Briefcase,
    },
    {
      title: t('candidates'),
      url: '/dashboard/candidates',
      icon: Users,
    },
    {
      title: t('settings'),
      url: '/dashboard/settings',
      icon: Settings,
    },
  ];

  return (
    <Sidebar collapsible='icon' className='border-r border-white/5'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size='lg'
              asChild
              className='hover:bg-transparent focus-visible:ring-0'
            >
              <Link href='/' className='flex items-center gap-3 px-1 py-4'>
                <div className='flex aspect-square size-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-accent to-brand-glow text-white shadow-lg shadow-brand-accent/20'>
                  <Sparkles className='size-6' />
                </div>
                <div className='flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden'>
                  <span className='text-lg font-bold tracking-tight text-white'>
                    {t('title')}
                  </span>
                  <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80'>
                    {t('subtitle')}
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className='px-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/50'>
            {t('mainMenu')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='gap-1 px-2'>
              {items.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.title}
                      className={cn(
                        'h-11 px-3 transition-all duration-200',
                        isActive
                          ? 'bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-white',
                      )}
                    >
                      <Link href={item.url}>
                        <item.icon
                          className={cn(
                            'size-5',
                            isActive && 'text-brand-accent',
                          )}
                        />
                        <span className='font-medium'>{item.title}</span>
                        {isActive && (
                          <div className='ml-auto size-1.5 rounded-full bg-brand-accent shadow-[0_0_8px_rgba(99,102,241,0.6)]' />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className='p-4'>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='h-14 rounded-xl border border-white/5 bg-white/2 px-3 ring-brand-accent transition-all hover:bg-white/5 data-state-open:bg-white/5'
                >
                  <Avatar className='h-9 w-9 border border-white/10 ring-2 ring-brand-accent/20 transition-all group-hover:ring-brand-accent/40'>
                    <AvatarImage src='' alt={user?.full_name || 'User'} />
                    <AvatarFallback className='bg-linear-to-br from-slate-800 to-slate-950 text-[10px] font-bold text-white'>
                      {user?.full_name?.substring(0, 2).toUpperCase() || 'TF'}
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                    <span className='truncate font-semibold text-white'>
                      {user?.full_name || 'Recruiter'}
                    </span>
                    <span className='truncate text-[11px] font-medium text-muted-foreground'>
                      {user?.email}
                    </span>
                  </div>
                  <ChevronUp className='ml-auto h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side='top'
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-white/5 bg-[#1e293b]/95 backdrop-blur-xl'
                align='end'
                sideOffset={12}
              >
                <DropdownMenuItem className='gap-2 rounded-lg py-2.5 focus:bg-white/5'>
                  <User2 className='size-4 text-muted-foreground' />
                  <span className='font-medium text-white'>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className='gap-2 rounded-lg py-2.5 focus:bg-white/5'>
                  <Settings className='size-4 text-muted-foreground' />
                  <span className='font-medium text-white'>
                    Account Settings
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={async () => {
                    await deleteSession();
                    logout();
                    router.push('/auth/login');
                  }}
                  className='gap-2 rounded-lg py-2.5 text-red-400 focus:bg-red-400/10 focus:text-red-400 cursor-pointer'
                >
                  <LogOut className='size-4' />
                  <span className='font-medium'>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
