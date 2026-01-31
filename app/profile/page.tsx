"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../stores/useSessionStore';
import InterestSelector from '../../components/Profile/InterestSelector';

export default function ProfilePage() {
  const router = useRouter();
  const session = useSessionStore((s) => s.session);
  const setSession = useSessionStore((s) => s.setSession);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

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
        const json = await res.json();
        setSession({
          ...session,
          displayName: data.displayName,
          interests: data.chosen,
          comfortLevel: data.comfortLevel
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!session.userId) {
    return (
      <div className="container mx-auto px-6 py-10">
        <div className="card p-6 text-center">
          <p className="text-slate-600">Please log in to view your profile.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="mt-4 rounded bg-indigo-600 text-white px-4 py-2"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] items-start">
        <section className="card p-6">
          <h2 className="text-3xl font-semibold">Your Profile</h2>
          <p className="mt-2 text-sm text-slate-600">
            Manage your anonymous identity and preferences.
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
              <div className="text-xs text-slate-500">Ink ID</div>
              <div className="text-lg font-mono font-semibold text-slate-900">{session.inkId}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
              <div className="text-xs text-slate-500">Display Name</div>
              <div className="text-lg font-semibold text-slate-900">{session.displayName || 'Not set'}</div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
              <div className="text-xs text-slate-500">Comfort Level</div>
              <div className="text-lg font-semibold text-slate-900 capitalize">
                {(session.comfortLevel as string) || 'Not set'}
              </div>
            </div>

            {session.interests && session.interests.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white/80 px-4 py-3">
                <div className="text-xs text-slate-500 mb-2">Interests</div>
                <div className="flex flex-wrap gap-2">
                  {session.interests.map((interest: string) => (
                    <span
                      key={interest}
                      className="inline-block rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-medium"
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
            className="mt-6 rounded-full bg-slate-900 text-white px-5 py-2"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </section>

        {isEditing && (
          <section className="glass p-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold">Update Profile</h3>
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
