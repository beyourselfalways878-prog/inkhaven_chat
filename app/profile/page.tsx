"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../stores/useSessionStore';
import InterestSelector from '../../components/Profile/InterestSelector';
import { Avatar } from '../../components/ui/avatar';
import { KarmaLevel } from '../../components/ui/badge';
import { InkAura } from '../../components/InkAura';
import { useToast } from '../../components/ui/toast';

export default function ProfilePage() {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleProfileUpdate = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session.userId,
          displayName: data.displayName,
          interests: data.chosen,
          comfortLevel: data.comfortLevel
        })
      });

      if (res.ok) {
        await res.json();
        setSession({
          ...session,
          displayName: data.displayName,
          interests: data.chosen,
          comfortLevel: data.comfortLevel
        });
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile. Try again.');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!session.userId) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="card p-10 text-center">
          <p className="text-slate-500 dark:text-white/60">Please create your profile to continue.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="btn-primary mt-6"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  const auraSeed = session.auraSeed ?? hashCode(session.userId);
  const reputation = session.reputation ?? 50;

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          {/* Aura + Avatar hero */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <InkAura seed={auraSeed} reputation={reputation} size="lg" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Avatar
                  userId={session.userId}
                  displayName={session.displayName || undefined}
                  auraSeed={auraSeed}
                  reputation={reputation}
                  size="lg"
                />
              </div>
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white">
              {session.displayName || 'Anonymous'}
            </h2>
            <div className="mt-1 text-sm text-slate-400 dark:text-white/40 font-mono">{session.inkId}</div>
            <div className="mt-3">
              <KarmaLevel reputation={reputation} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] px-4 py-3">
              <div className="text-xs text-slate-400 dark:text-white/40">Comfort Level</div>
              <div className="text-base font-medium text-slate-900 dark:text-white capitalize">
                {(session.comfortLevel as string) || 'Not set'}
              </div>
            </div>

            {session.interests && session.interests.length > 0 && (
              <div className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.03] px-4 py-3">
                <div className="text-xs text-slate-400 dark:text-white/40 mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {session.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="inline-block rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 px-3 py-1 text-xs font-medium"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`mt-6 w-full ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </section>

        {isEditing && (
          <section className="glass p-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                <span>Update Profile</span>
                {loading && <span className="text-sm text-indigo-400">Saving...</span>}
              </h3>
              <div className="mt-6">
                <InterestSelector
                  onSubmit={handleProfileUpdate}
                  initialData={{
                    displayName: session.displayName || '',
                    chosen: session.interests || [],
                    comfortLevel: (session.comfortLevel as string) || 'balanced'
                  }}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}
