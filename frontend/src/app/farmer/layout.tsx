import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FarmerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout workspaceRole="farmer">{children}</DashboardLayout>;
}
