'use client';

import { signOut } from '@/app/actions';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    router.push('/login');
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="px-3 py-1 text-sm"
      onClick={handleSignOut}
      disabled={loading}
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}