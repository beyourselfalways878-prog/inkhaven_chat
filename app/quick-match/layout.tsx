import RequireProfile from '../../components/RequireProfile';

export default function QuickMatchLayout({ children }: { children: React.ReactNode }) {
    return <RequireProfile>{children}</RequireProfile>;
}
