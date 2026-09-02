import { Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import RequireAuth from './components/RequireAuth';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Search from './pages/Search';
import VendorDetail from './pages/VendorDetail';

import Onboarding from './pages/Onboarding';
import MyWorkspace from './pages/MyWorkspace';
import InquiryDetail from './pages/InquiryDetail';
import QuoteDetail from './pages/QuoteDetail';
import BookingDetail from './pages/BookingDetail';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';

import AdminDashboard from './pages/AdminDashboard';
import AdminList from './pages/AdminList';
import AdminCustomers from './pages/admin/Customers';
import AdminInquiries from './pages/admin/Inquiries';
import AdminQuotes from './pages/admin/Quotes';
import AdminBookings from './pages/admin/Bookings';
import AdminPayments from './pages/admin/Payments';
import AdminOutbox from './pages/admin/Outbox';
import AdminAutomation from './pages/admin/Automation';
import AdminOrganizations from './pages/admin/Organizations';
import AdminAuditLog from './pages/admin/AuditLog';
import AdminAnalytics from './pages/admin/Analytics';

export default function App() {
  return (
    <Routes>
      {/* App shell wraps every route. Auth pages render in fullscreen split-screen,
          the rest get sidebar + topbar. */}
      <Route element={<AppShell />}>
        {/* Auth / landing */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/landing" element={<Landing />} />

        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/search" element={<Search />} />
        <Route path="/vendors/:id" element={<VendorDetail />} />

        {/* Customer workspace */}
        <Route path="/customers/me" element={<RequireAuth roles={['CUSTOMER']}><MyWorkspace /></RequireAuth>} />
        <Route path="/onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
        <Route path="/inquiries" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/inquiries/:id" element={<RequireAuth><InquiryDetail /></RequireAuth>} />
        <Route path="/quotes" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/quotes/:id" element={<RequireAuth><QuoteDetail /></RequireAuth>} />
        <Route path="/bookings" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/bookings/:id" element={<RequireAuth><BookingDetail /></RequireAuth>} />
        <Route path="/budget" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/guests" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/tasks" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/timeline" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/documents" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/messages" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/activity" element={<RequireAuth><MyWorkspace /></RequireAuth>} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />

        {/* Admin cockpit */}
        <Route path="/admin" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN', 'PARTNER_OWNER', 'PARTNER_STAFF']}><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/customers" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN']}><AdminCustomers /></RequireAuth>} />
        <Route path="/admin/inquiries" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN', 'PARTNER_OWNER', 'PARTNER_STAFF']}><AdminInquiries /></RequireAuth>} />
        <Route path="/admin/inquiries/:id" element={<RequireAuth><InquiryDetail /></RequireAuth>} />
        <Route path="/admin/quotes" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN', 'PARTNER_OWNER', 'PARTNER_STAFF']}><AdminQuotes /></RequireAuth>} />
        <Route path="/admin/quotes/:id" element={<RequireAuth><QuoteDetail /></RequireAuth>} />
        <Route path="/admin/bookings" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN', 'PARTNER_OWNER', 'PARTNER_STAFF']}><AdminBookings /></RequireAuth>} />
        <Route path="/admin/bookings/:id" element={<RequireAuth><BookingDetail /></RequireAuth>} />
        <Route path="/admin/payments" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN']}><AdminPayments /></RequireAuth>} />
        <Route path="/admin/outbox" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN']}><AdminOutbox /></RequireAuth>} />
        <Route path="/admin/automation" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN']}><AdminAutomation /></RequireAuth>} />
        <Route path="/admin/organizations" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN']}><AdminOrganizations /></RequireAuth>} />
        <Route path="/admin/audit" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN']}><AdminAuditLog /></RequireAuth>} />
        <Route path="/admin/analytics" element={<RequireAuth roles={['ADMIN', 'SUPER_ADMIN']}><AdminAnalytics /></RequireAuth>} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-[60vh] grid place-items-center text-center">
            <div>
              <div className="font-display text-[80px] font-semibold bg-gradient-to-br from-aura-300 to-gold-300 bg-clip-text text-transparent tracking-[-0.04em]">404</div>
              <p className="text-platinum-300/70 mt-2">That page does not exist.</p>
            </div>
          </div>
        } />
      </Route>
    </Routes>
  );
}
