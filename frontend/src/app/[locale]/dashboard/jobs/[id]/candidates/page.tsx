'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/useAuthStore';

// Imported components
import { fetchJobCandidates } from '@/services/api/candidates';
import { CandidatesTable } from '@/components/features/dashboard/candidates/candidates-table';
import { CandidateSheet } from '@/components/features/dashboard/candidates/candidate-sheet';
import { CandidateResult } from '@/types/candidates';

export default function CandidatesPage() {
  const t = useTranslations('Dashboard');
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
    queryFn: () => fetchJobCandidates(jobId, token!),
    enabled: !!jobId && !!token,
  });

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
            <CandidatesTable
              candidates={candidates || []}
              onSelect={setSelectedCandidate}
            />
          )}
        </CardContent>
      </Card>

      <CandidateSheet
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
      />
    </div>
  );
}
