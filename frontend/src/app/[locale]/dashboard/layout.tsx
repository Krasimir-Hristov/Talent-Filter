import { AppSidebar } from '@/components/features/dashboard/app-sidebar';
import { Link } from '@/i18n/routing';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { DashboardBreadcrumb } from '@/components/features/dashboard/dashboard-breadcrumb';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation'; // Use core redirect for simple server-side jumps OR i18n redirect

const AUTH_COOKIE = 'tf_session';

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(AUTH_COOKIE);

  if (!sessionCookie) {
    redirect(`/${locale}/auth/login`);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className='bg-background'>
        <header className='flex h-16 shrink-0 items-center gap-2 border-b border-white/5 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
          <div className='flex items-center gap-2 px-6'>
            <SidebarTrigger className='-ml-1 text-muted-foreground hover:bg-white/5 hover:text-white' />
            <Separator
              orientation='vertical'
              className='mr-2 h-4 bg-white/10'
            />
            <DashboardBreadcrumb />
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-6 pt-6'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
