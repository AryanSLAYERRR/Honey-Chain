import DashboardLayout from '@/components/layout/DashboardLayout';

export default function BlockchainLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout workspaceRole="admin">{children}</DashboardLayout>;
}
