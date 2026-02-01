import { JobCreationWizard } from '@/components/features/builder';

export default function NewJobPage() {
  return (
    <div className='flex flex-col gap-8'>
      <JobCreationWizard />
    </div>
  );
}
