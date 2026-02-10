'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  MoreHorizontal,
  User,
  Clock,
  Eye,
  ShieldCheck,
  Copy,
} from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { useAuthStore } from '@/store/useAuthStore';

// Types
interface CandidateResult {
  candidate_id: string;
  interview_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  status: string;
  end_time: string | null;
  total_time_spent: number;
  paste_count: number;
  tab_switches: number;
  ai_score: number | null;
}

// Simple API fetcher (inline for now to avoid complexity)
const fetchCandidates = async (jobId: string, token: string) => {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const res = await fetch(`${API_URL}/jobs/${jobId}/candidates`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json() as Promise<CandidateResult[]>;
};

export default function CandidatesPage() {
  const t = useTranslations('Dashboard'); // Fallback or assume keys exist
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const { accessToken: token } = useAuthStore();

  const [selectedCandidate, setSelectedCandidate] =
    useState<CandidateResult | null>(null);

  const {
    data: candidates,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['candidates', jobId],
    queryFn: () => fetchCandidates(jobId, token!),
    enabled: !!jobId && !!token,
  });

  const handleRowClick = (candidate: CandidateResult) => {
    setSelectedCandidate(candidate);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

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

  return (
    <div className='container py-8 max-w-7xl mx-auto space-y-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <Button
            variant='ghost'
            size='sm'
            className='mb-2 -ml-2 text-muted-foreground'
            onClick={() => router.back()}
          >
            <ArrowLeft className='mr-2 h-4 w-4' /> Back to Job
          </Button>
          <h1 className='text-3xl font-bold tracking-tight'>Candidates</h1>
          <p className='text-muted-foreground'>
            Review completed interviews and analyze results.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Completed Interviews</CardTitle>
          <CardDescription>
            {candidates?.length || 0} candidates have finished the process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='space-y-4'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='flex items-center space-x-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-[250px]' />
                    <Skeleton className='h-4 w-[200px]' />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className='text-center py-10 text-red-500'>
              Failed to load candidates. Please try again.
            </div>
          ) : candidates?.length === 0 ? (
            <div className='text-center py-16 text-muted-foreground'>
              <User className='w-12 h-12 mx-auto mb-4 opacity-20' />
              <p>No candidates have completed the interview yet.</p>
            </div>
          ) : (
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
                  {candidates?.map((candidate) => (
                    <tr
                      key={candidate.interview_id}
                      className='bg-background border-b hover:bg-muted/50 cursor-pointer transition-colors'
                      onClick={() => handleRowClick(candidate)}
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
                      <td className='px-6 py-4'>
                        {getIntegrityBadge(candidate)}
                      </td>
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
          )}
        </CardContent>
      </Card>

      {/* Candidate Detail Sheet */}
      <Sheet
        open={!!selectedCandidate}
        onOpenChange={(open) => !open && setSelectedCandidate(null)}
      >
        <SheetContent className='sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto'>
          {selectedCandidate && (
            <>
              <SheetHeader className='mb-6'>
                <SheetTitle className='text-2xl'>
                  {selectedCandidate.first_name} {selectedCandidate.last_name}
                </SheetTitle>
                <SheetDescription>
                  {selectedCandidate.email} • {selectedCandidate.phone}
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
                      {formatDuration(selectedCandidate.total_time_spent)}
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
                            selectedCandidate.paste_count > 3
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {selectedCandidate.paste_count} detected
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
                            selectedCandidate.tab_switches > 5
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {selectedCandidate.tab_switches} times
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Answer Breakdown (Placeholder for now) */}
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
    </div>
  );
}
