import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import AdminLayout from './components/layout/AdminLayout'
import Login from './pages/Login'
import Register from './pages/Register'
import VerifyEmail from './pages/VerifyEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Listings from './pages/Listings'
import ListingDetail from './pages/ListingDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import OrderConfirmation from './pages/OrderConfirmation'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminOrders from './pages/admin/AdminOrders'
import AdminBatches from './pages/admin/AdminBatches'
import AdminListings from './pages/admin/AdminListings'
import AdminSlots from './pages/admin/AdminSlots'
import AdminProduce from './pages/admin/AdminProduce'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import RequireAdmin from './components/auth/RequireAdmin'
import Home from './pages/Home'
import Account from './pages/Account'
import FulfilledOrderBanner from './components/order/FulfilledOrderBanner'

function CustomerShell({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-farm-bg">
      <Navbar />
       <FulfilledOrderBanner />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="batches" element={<AdminBatches />} />
            <Route path="listings" element={<AdminListings />} />
            <Route path="slots" element={<AdminSlots />} />
            <Route path="produce" element={<AdminProduce />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>
        </Route>

        <Route path="/" element={<CustomerShell><Home /></CustomerShell>} />
        <Route path="/login" element={<CustomerShell><Login /></CustomerShell>} />
        <Route path="/register" element={<CustomerShell><Register /></CustomerShell>} />
        <Route path="/verify-email" element={<CustomerShell><VerifyEmail /></CustomerShell>} />
        <Route path="/forgot-password" element={<CustomerShell><ForgotPassword /></CustomerShell>} />
        <Route path="/reset-password" element={<CustomerShell><ResetPassword /></CustomerShell>} />
        <Route path="/listings" element={<CustomerShell><Listings /></CustomerShell>} />
        <Route path="/listings/:id" element={<CustomerShell><ListingDetail /></CustomerShell>} />
        <Route path="/cart" element={<CustomerShell><Cart /></CustomerShell>} />
        <Route path="/checkout" element={<CustomerShell><Checkout /></CustomerShell>} />
        <Route path="/order-confirmation" element={<CustomerShell><OrderConfirmation /></CustomerShell>} />
        <Route path="/orders" element={<CustomerShell><Orders /></CustomerShell>} />
        <Route path="/orders/:orderId" element={<CustomerShell><OrderDetail /></CustomerShell>} />
        <Route path="/account" element={<CustomerShell><Account /></CustomerShell>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App