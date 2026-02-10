'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Copy, Eye } from 'lucide-react';
import { CandidateResult } from '@/types/candidates';

interface CandidateSheetProps {
  candidate: CandidateResult | null;
  onClose: () => void;
}

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

export const CandidateSheet = ({ candidate, onClose }: CandidateSheetProps) => (
  <Sheet open={!!candidate} onOpenChange={(open) => !open && onClose()}>
    <SheetContent className='sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto'>
      {candidate && (
        <>
          <SheetHeader className='mb-6'>
            <SheetTitle className='text-2xl'>
              {candidate.first_name} {candidate.last_name}
            </SheetTitle>
            <SheetDescription>
              {candidate.email} • {candidate.phone}
            </SheetDescription>
          </SheetHeader>

          <div className='space-y-6'>
            {/* Summary Stats */}
            <div className='grid grid-cols-2 gap-4'>
              <div className='p-4 rounded-lg bg-muted/50 border'>
                <div className='text-sm text-muted-foreground mb-1'>
                  Total Time
                </div>
                <div className='text-2xl font-bold font-mono'>
                  {formatDuration(candidate.total_time_spent)}
                </div>
              </div>
              <div className='p-4 rounded-lg bg-muted/50 border'>
                <div className='text-sm text-muted-foreground mb-1'>
                  AI Score
                </div>
                <div className='text-2xl font-bold text-muted-foreground'>
                  -- / 100
                </div>
              </div>
            </div>

            {/* Integrity Report */}
            <div>
              <h3 className='text-lg font-semibold mb-3 flex items-center gap-2'>
                <ShieldCheck className='w-5 h-5 text-indigo-600' />
                Integrity Report
              </h3>
              <Card>
                <CardContent className='pt-6 space-y-4'>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <Copy className='w-4 h-4 text-muted-foreground' />
                      <span>Paste Events</span>
                    </div>
                    <Badge
                      variant={
                        candidate.paste_count > 3 ? 'destructive' : 'secondary'
                      }
                    >
                      {candidate.paste_count} detected
                    </Badge>
                  </div>
                  <Separator />
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center gap-2'>
                      <Eye className='w-4 h-4 text-muted-foreground' />
                      <span>Focus Lost (Tab Switches)</span>
                    </div>
                    <Badge
                      variant={
                        candidate.tab_switches > 5 ? 'destructive' : 'secondary'
                      }
                    >
                      {candidate.tab_switches} times
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Answer Breakdown Placeholder */}
            <div>
              <h3 className='text-lg font-semibold mb-3'>Answers</h3>
              <div className='p-4 border rounded-md bg-muted/20 text-center text-muted-foreground text-sm'>
                Detailed answer review coming in Phase 5 (AI Grading).
              </div>
            </div>
          </div>
        </>
      )}
    </SheetContent>
  </Sheet>
);
