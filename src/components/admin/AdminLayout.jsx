import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
export default function AdminLayout() { return <div className="admin-shell"><a href="#admin-content" className="skip-link">Skip to content</a><AdminSidebar /><div className="admin-workspace"><AdminHeader /><main id="admin-content" className="admin-content"><Outlet /></main></div></div>; }
