'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

const items = [
  {
    title: 'Overview',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Jobs',
    url: '/dashboard/jobs',
    icon: Briefcase,
  },
  {
    title: 'Candidates',
    url: '/dashboard/candidates',
    icon: Users,
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

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
              <Link
                href='/dashboard'
                className='flex items-center gap-3 px-1 py-4'
              >
                <div className='flex aspect-square size-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-accent to-brand-glow text-white shadow-lg shadow-brand-accent/20'>
                  <Sparkles className='size-6' />
                </div>
                <div className='flex flex-col gap-0.5 leading-none group-data-[collapsible=icon]:hidden'>
                  <span className='text-lg font-bold tracking-tight text-white'>
                    TalentFilter
                  </span>
                  <span className='text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80'>
                    SaaS Platform
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
            Main Menu
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
                  className='h-14 rounded-xl border border-white/5 bg-white/[0.02] px-3 ring-brand-accent transition-all hover:bg-white/[0.05] data-[state=open]:bg-white/[0.05]'
                >
                  <Avatar className='h-9 w-9 border border-white/10 ring-2 ring-brand-accent/20 transition-all group-hover:ring-brand-accent/40'>
                    <AvatarImage src='' alt='User' />
                    <AvatarFallback className='bg-gradient-to-br from-slate-800 to-slate-950 text-[10px] font-bold text-white'>
                      KH
                    </AvatarFallback>
                  </Avatar>
                  <div className='grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden'>
                    <span className='truncate font-semibold text-white'>
                      Krasimir Hristov
                    </span>
                    <span className='truncate text-[11px] font-medium text-muted-foreground'>
                      Admin Recruiter
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
                <DropdownMenuItem className='gap-2 rounded-lg py-2.5 text-red-400 focus:bg-red-400/10 focus:text-red-400'>
                  <LogOut className='size-4' />
                  <span className='font-medium'>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
