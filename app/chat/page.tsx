import { redirect } from 'next/navigation';

export default function ChatIndexPage() {
  // Direct users trying to access the base /chat route to the matchmaking lounge
  redirect('/quick-match');
}
