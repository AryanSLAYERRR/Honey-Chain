import DashboardLayout from '@/components/layout/DashboardLayout';

export default function TransporterLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout workspaceRole="processor">{children}</DashboardLayout>;
}
