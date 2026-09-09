'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth, roleConfig } from '@/lib/auth-context';
import { mockUsers } from '@/lib/mock-data';
import type { UserRole } from '@/lib/types';
import { BookOpen, ChevronDown, Factory, Home, Link2, LogOut, Menu, Package, QrCode, ShieldCheck, Sprout, Store, X } from 'lucide-react';
import { ThemeToggle } from '@/lib/theme-context';
import WalletConnectButton from '@/components/ui/WalletConnectButton';

const items: Record<UserRole, { label: string; icon: React.ElementType; href: string }[]> = {
  farmer: [{ label: 'Today at the apiary', icon: Home, href: '/farmer' }, { label: 'Hive ledger', icon: Sprout, href: '/farmer/hives' }, { label: 'Harvest records', icon: Package, href: '/farmer/batches' }],
  admin: [{ label: 'Evidence review', icon: ShieldCheck, href: '/admin' }],
  processor: [{ label: 'Batch workbench', icon: Factory, href: '/processor' }, { label: 'Honey exchange', icon: Store, href: '/marketplace' }],
  consumer: [],
};
const names: Record<UserRole, string> = { farmer: 'Apiary fieldbook', admin: 'Evidence desk', processor: 'Batch workbench', consumer: 'Bottle passport' };
const icons: Record<UserRole, React.ElementType> = { farmer: Sprout, admin: ShieldCheck, processor: Factory, consumer: QrCode };

export default function DashboardLayout({ children, workspaceRole }: { children: React.ReactNode; workspaceRole?: UserRole }) {
  const router = useRouter(); const pathname = usePathname(); const { currentRole, currentUser, switchRole, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false); const [rolesOpen, setRolesOpen] = useState(false);
  const role = workspaceRole ?? currentRole; const user = role === currentRole ? currentUser : mockUsers[role]; const RoleIcon = icons[role];
  const choose = (next: UserRole) => { switchRole(next); setRolesOpen(false); setMobileOpen(false); router.push(roleConfig[next].path); };
  const rail = (mobile = false) => <aside className={`workspace-rail ${mobile ? 'workspace-rail--mobile' : ''}`}>
    <div className="workspace-rail__brand"><button onClick={() => router.push('/')}><span><BookOpen /></span><b>HoneyChain</b></button>{mobile && <button className="workspace-rail__close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X /></button>}</div>
    <div className="workspace-rail__profile"><small>Viewing as</small><button onClick={() => setRolesOpen(!rolesOpen)} aria-expanded={rolesOpen}><span><RoleIcon /></span><div><b>{user.name}</b><em>{names[role]}</em></div><ChevronDown /></button>{rolesOpen && <div className="workspace-rail__roles">{(Object.keys(roleConfig) as UserRole[]).filter(key => key !== 'consumer').map(key => { const Icon = icons[key]; return <button key={key} className={key === role ? 'is-current' : ''} onClick={() => choose(key)}><Icon />{names[key]}</button>; })}</div>}</div>
    <nav aria-label="Workspace navigation">{items[role].map(item => { const Icon = item.icon; const active = pathname === item.href; return <button key={item.label} className={active ? 'is-active' : ''} onClick={() => { router.push(item.href); setMobileOpen(false); }}><Icon />{item.label}</button>; })}</nav>
    <div className="workspace-rail__bottom"><button onClick={() => router.push('/blockchain')}><Link2 /> Record ledger</button><button onClick={() => choose('consumer')}><QrCode /> Verify a bottle</button><button className="workspace-rail__exit" onClick={() => { logout(); router.push('/'); }}><LogOut /> Sign out</button></div>
  </aside>;
  return <div className="workspace-shell"><div className="workspace-desktop">{rail()}</div><header className="workspace-mobile"><button onClick={() => router.push('/')}><BookOpen /> HoneyChain</button><div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><WalletConnectButton /><ThemeToggle /><button onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu /></button></div></header>{mobileOpen && <div className="workspace-drawer"><button aria-label="Close navigation" onClick={() => setMobileOpen(false)} />{rail(true)}</div>}<main className="workspace-main"><header className="workspace-topbar"><span>{names[role]}</span><div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><WalletConnectButton /><ThemeToggle /><button onClick={() => router.push('/blockchain')}>Open signed record <Link2 /></button></div></header><div className="workspace-content">{children}</div></main></div>;
}
