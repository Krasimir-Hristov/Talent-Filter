'use client';

import { MoreHorizontal, Clock, Eye, ShieldCheck, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CandidateResult } from '@/types/candidates';

interface CandidatesTableProps {
  candidates: CandidateResult[];
  onSelect: (candidate: CandidateResult) => void;
}

// Helper: Format Seconds to Readable String
const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
};

// Helper: Integrity Badge
const getIntegrityBadge = (c: CandidateResult) => {
  const isSuspicious = c.paste_count > 3 || c.tab_switches > 5;

  if (isSuspicious) {
    return (
      <div className='flex gap-2'>
        {c.paste_count > 3 && (
          <Badge variant='destructive' className='gap-1'>
            <Copy className='w-3 h-3' /> {c.paste_count}
          </Badge>
        )}
        {c.tab_switches > 5 && (
          <Badge
            variant='destructive'
            className='gap-1 bg-amber-600 hover:bg-amber-700'
          >
            <Eye className='w-3 h-3' /> {c.tab_switches}
          </Badge>
        )}
      </div>
    );
  }
  return (
    <Badge
      variant='outline'
      className='text-green-600 border-green-200 bg-green-50'
    >
      <ShieldCheck className='w-3 h-3 mr-1' /> Verified
    </Badge>
  );
};

export const CandidatesTable = ({
  candidates,
  onSelect,
}: CandidatesTableProps) => {
  if (!candidates.length) return null;

  return (
    <div className='relative overflow-x-auto'>
      <table className='w-full text-sm text-left'>
        <thead className='text-xs text-muted-foreground uppercase bg-muted/50'>
          <tr>
            <th className='px-6 py-3'>Candidate</th>
            <th className='px-6 py-3'>Completed</th>
            <th className='px-6 py-3'>Time Spent</th>
            <th className='px-6 py-3'>Integrity Check</th>
            <th className='px-6 py-3 text-right'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr
              key={candidate.interview_id}
              className='bg-background border-b hover:bg-muted/50 cursor-pointer transition-colors'
              onClick={() => onSelect(candidate)}
            >
              <td className='px-6 py-4 font-medium'>
                <div className='flex flex-col'>
                  <span className='text-base font-semibold text-foreground'>
                    {candidate.first_name} {candidate.last_name}
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    {candidate.email}
                  </span>
                </div>
              </td>
              <td className='px-6 py-4'>
                {candidate.end_time
                  ? new Date(candidate.end_time).toLocaleString()
                  : '-'}
              </td>
              <td className='px-6 py-4'>
                <div className='flex items-center gap-2'>
                  <Clock className='w-4 h-4 text-muted-foreground' />
                  {formatDuration(candidate.total_time_spent)}
                </div>
              </td>
              <td className='px-6 py-4'>{getIntegrityBadge(candidate)}</td>
              <td className='px-6 py-4 text-right'>
                <Button variant='ghost' size='icon'>
                  <MoreHorizontal className='w-4 h-4' />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
