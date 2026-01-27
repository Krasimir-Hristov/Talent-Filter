import { AppSidebar } from '@/components/features/dashboard/app-sidebar';
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className='hidden md:block'>
                  <BreadcrumbLink
                    href='/dashboard'
                    className='text-muted-foreground hover:text-white'
                  >
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className='hidden md:block text-muted-foreground/50' />
                <BreadcrumbItem>
                  <BreadcrumbPage className='font-medium text-white'>
                    Overview
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className='flex flex-1 flex-col gap-4 p-6 pt-6'>{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
