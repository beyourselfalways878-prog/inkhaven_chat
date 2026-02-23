import RequireProfile from '../../components/RequireProfile';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    return <RequireProfile>{children}</RequireProfile>;
}
