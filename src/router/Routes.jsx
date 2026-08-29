import { createBrowserRouter } from 'react-router-dom'

import PublicLayout from '../components/layout/PublicLayout'

import Home from '../pages/public/Home'
import Explore from '../pages/public/Explore'
import DealsFeed from '../pages/public/DealsFeed'
import BusinessDetails from '../pages/public/BusinessDetails'
import DealDetails from '../pages/public/DealDetails'
import About from '../pages/public/About'
import Contact from '../pages/public/Contact'
import NotFound from '../pages/public/NotFound'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'

import CustomerLayout from '../pages/customer/CustomerLayout'
import CustomerDashboard from '../pages/customer/Dashboard'
import SavedDeals from '../pages/customer/SavedDeals'
import Following from '../pages/customer/Following'
import MyReviews from '../pages/customer/MyReviews'
import CustomerNotifications from '../pages/customer/Notifications'
import ProfileSettings from '../pages/customer/ProfileSettings'

import MerchantLayout from '../pages/merchant/MerchantLayout'
import MerchantDashboard from '../pages/merchant/Dashboard'
import BusinessProfile from '../pages/merchant/BusinessProfile'
import DealsManagement from '../pages/merchant/DealsManagement'
import AddEditDeal from '../pages/merchant/AddEditDeal'
import CrossPromotions from '../pages/merchant/CrossPromotions'
import CreateCrossPromotion from '../pages/merchant/CreateCrossPromotion'
import MerchantReviews from '../pages/merchant/Reviews'
import MerchantNotifications from '../pages/merchant/Notifications'

import AdminLayout from '../pages/admin/AdminLayout'
import AdminDashboard from '../pages/admin/Dashboard'
import MerchantVerification from '../pages/admin/MerchantVerification'
import UserManagement from '../pages/admin/UserManagement'
import BusinessManagement from '../pages/admin/BusinessManagement'
import ReviewModeration from '../pages/admin/ReviewModeration'
import Analytics from '../pages/admin/Analytics'
import AdminSettings from '../pages/admin/Settings'
import RequireRole, { AdminOnly } from './RequireRole'

export const router = createBrowserRouter([
  {
    element: (
      <AdminOnly>
        <PublicLayout />
      </AdminOnly>
    ),
    children: [
      { path: '/', element: <Home /> },
      { path: '/explore', element: <Explore /> },
      { path: '/deals', element: <DealsFeed /> },
      { path: '/vendors/:id', element: <BusinessDetails /> },
      { path: '/deals/:id', element: <DealDetails /> },
      { path: '/about', element: <About /> },
      { path: '/contact', element: <Contact /> },
    ],
  },

  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },

  {
    element: (
      <AdminOnly>
        <CustomerLayout />
      </AdminOnly>
    ),
    children: [
      { path: '/account', element: <CustomerDashboard /> },
      { path: '/account/saved-deals', element: <SavedDeals /> },
      { path: '/account/following', element: <Following /> },
      { path: '/account/reviews', element: <MyReviews /> },
      { path: '/account/notifications', element: <CustomerNotifications /> },
      { path: '/account/settings', element: <ProfileSettings /> },
    ],
  },

  {
    element: (
      <AdminOnly>
        <RequireRole role="merchant">
          <MerchantLayout />
        </RequireRole>
      </AdminOnly>
    ),
    children: [
      { path: '/merchant', element: <MerchantDashboard /> },
      { path: '/merchant/profile', element: <BusinessProfile /> },
      { path: '/merchant/deals', element: <DealsManagement /> },
      { path: '/merchant/deals/new', element: <AddEditDeal /> },
      { path: '/merchant/deals/:id/edit', element: <AddEditDeal /> },
      { path: '/merchant/promotions', element: <CrossPromotions /> },
      { path: '/merchant/promotions/new', element: <CreateCrossPromotion /> },
      { path: '/merchant/reviews', element: <MerchantReviews /> },
      { path: '/merchant/notifications', element: <MerchantNotifications /> },
    ],
  },

  {
    element: (
      <RequireRole role="admin">
        <AdminLayout />
      </RequireRole>
    ),
    children: [
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/verification', element: <MerchantVerification /> },
      { path: '/admin/users', element: <UserManagement /> },
      { path: '/admin/businesses', element: <BusinessManagement /> },
      { path: '/admin/reviews', element: <ReviewModeration /> },
      { path: '/admin/analytics', element: <Analytics /> },
      { path: '/admin/settings', element: <AdminSettings /> },
    ],
  },

  { path: '*', element: <NotFound /> },
])