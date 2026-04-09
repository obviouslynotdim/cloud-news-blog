import { useState } from 'react';
import { AdminNewsManager } from '../components/admin/AdminNewsManager';
import { PublishForm } from '../components/publish/PublishForm';

export function PublishPage({ onCreated, authUser, onOpenAuth }) {
  const [refreshKey, setRefreshKey] = useState(0);

  if (!authUser) {
    return (
      <section className="rounded-xl border border-zinc-300 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-3xl text-zinc-950">Admin access required</h2>
        <p className="mt-3 text-zinc-600">Please login first and select the admin role to publish stories.</p>
        <button className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm font-bold text-white" onClick={() => onOpenAuth('login')}>
          Go to Login
        </button>
      </section>
    );
  }

  if (authUser.role !== 'admin') {
    return (
      <section className="rounded-xl border border-zinc-300 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-3xl text-zinc-950">Admin only section</h2>
        <p className="mt-3 text-zinc-600">You are signed in as a user. Publishing is available only to admin role.</p>
      </section>
    );
  }

  return (
    <>
      <PublishForm
        onCreated={onCreated}
        onPublished={() => {
          setRefreshKey((prev) => prev + 1);
        }}
      />
      <AdminNewsManager refreshKey={refreshKey} />
    </>
  );
}
