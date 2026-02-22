/* eslint-disable no-unused-vars */
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const interests = [
  'Gaming',
  'Music',
  'Movies',
  'Books',
  'Tech',
  'Sports',
  'Mental Health',
  'Philosophy',
  'Art',
  'Travel'
];

const schema = z.object({
  displayName: z.string().min(2, 'Enter a display name'),
  chosen: z.array(z.string()).min(1, 'Select at least one interest'),
  comfortLevel: z.string().optional()
});

type FormValues = z.infer<typeof schema>;

export default function InterestSelector({ onSubmit, initialData }: { onSubmit: (_values: FormValues) => void; initialData?: Partial<FormValues> }) {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: initialData?.displayName || '',
      chosen: initialData?.chosen || [],
      comfortLevel: initialData?.comfortLevel || 'balanced'
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Display name</label>
        <input
          {...register('displayName')}
          placeholder="Choose a calm alias"
          className="mt-2 block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 px-4 py-3 text-sm text-slate-900 dark:text-white shadow-sm focus:border-indigo-400 focus:outline-none"
        />
        {errors.displayName && <p className="text-xs text-red-600 mt-2">{errors.displayName.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comfort level</label>
        <select
          {...register('comfortLevel')}
          className="mt-2 block w-full rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 px-4 py-3 text-sm text-slate-900 dark:text-white shadow-sm"
          defaultValue="balanced"
        >
          <option value="gentle">Gentle & slow</option>
          <option value="balanced">Balanced</option>
          <option value="bold">Bold & direct</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Interests</label>
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
          {interests.map((i) => {
            const chosenInterests = watch('chosen') || [];
            const isChecked = chosenInterests.includes(i);
            return (
              <label key={i} className="group cursor-pointer">
                <input type="checkbox" value={i} {...register('chosen')} className="peer sr-only" />
                <span className={`flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium shadow-sm transition ${isChecked
                  ? 'border-indigo-400 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10'
                  : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 bg-white/90 dark:bg-white/5'
                  }`}>
                  {i}
                </span>
              </label>
            );
          })}
        </div>
        {errors.chosen && <p className="text-xs text-red-600 mt-2">{errors.chosen.message}</p>}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">You can change this anytime.</span>
        <button type="submit" className="rounded-full bg-slate-900 px-5 py-2 text-sm text-white shadow-sm">
          Save profile
        </button>
      </div>
    </form>
  );
}
