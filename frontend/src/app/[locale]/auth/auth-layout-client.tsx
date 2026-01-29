'use client';

import { motion } from 'framer-motion';
import { LandingHeader } from '@/components/layout/landing-header';

export function AuthLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className='relative min-h-screen w-full overflow-hidden bg-[#0f172a] flex items-center justify-center p-4'>
      <LandingHeader />
      {/* Background Ambient Glows */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className='absolute -top-[10%] -left-[10%] h-[500px] w-[500px] rounded-full bg-brand-accent/20 blur-[120px]'
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className='absolute -bottom-[10%] -right-[10%] h-[600px] w-[600px] rounded-full bg-brand-glow/10 blur-[100px]'
        />
      </div>

      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center mask-[linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className='relative z-10 w-full max-w-[440px]'
      >
        <div className='flex flex-col items-center mb-8'>
          <div className='size-12 rounded-2xl bg-linear-to-br from-brand-accent to-brand-glow flex items-center justify-center shadow-2xl shadow-brand-accent/20 mb-4'>
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='size-7 text-white'
            >
              <path d='m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z' />
              <path d='M5 3v4' />
              <path d='M19 17v4' />
              <path d='M3 5h4' />
              <path d='M17 19h4' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold tracking-tight text-white'>
            TalentFilter
          </h1>
          <p className='text-slate-400 text-sm font-medium mt-1 uppercase tracking-[0.2em]'>
            Recruiter Portal
          </p>
        </div>

        {children}
      </motion.div>
    </div>
  );
}
