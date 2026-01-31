export default function DateSeparator({ dateString }: { dateString: string }) {
  const d = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  function prettyDate(d: Date) {
    const ds = d.toDateString();
    if (ds === today.toDateString()) return 'Today';
    if (ds === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="w-full flex items-center my-2">
      <div className="flex-grow h-px bg-slate-200" />
      <div className="px-3 text-xs text-slate-500">{prettyDate(d)}</div>
      <div className="flex-grow h-px bg-slate-200" />
    </div>
  );
}