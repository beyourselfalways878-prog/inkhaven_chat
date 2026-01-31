"use client";

export default function TypingIndicator({ name }: { name?: string }) {
  return (
    <div className="px-4 py-2 text-sm text-slate-500">{name ? `${name} is typing...` : 'Someone is typing...'}</div>
  );
}
