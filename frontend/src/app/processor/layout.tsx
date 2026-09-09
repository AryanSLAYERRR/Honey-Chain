import DashboardLayout from '@/components/layout/DashboardLayout';

export default function ProcessorLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout workspaceRole="processor">{children}</DashboardLayout>;
}
