import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './lib/context/AuthContext'
import { InterestProvider } from './lib/context/InterestContext'
import ScrollToTop from './components/ScrollToTop'
import AuthLayout from './pages/auth/AuthLayout'
import BuyerRegister from './pages/auth/BuyerRegister'
import MarketerRegister from './pages/auth/MarketerRegister'
import Login from './pages/auth/Login'
import Home from './pages/Home'
import Properties from './pages/Properties'
import PropertyDetails from './pages/PropertyDetails'
import MyInterests from './pages/MyInterests'
import DashboardLayout from './pages/dashboard/DashboardLayout'
import Dashboard from './pages/dashboard/Dashboard'
import Listings from './pages/dashboard/Listings'
import Leads from './pages/dashboard/Leads'
import AddProperty from './pages/dashboard/AddProperty'
import EditProperty from './pages/dashboard/EditProperty'

function App() {
  return (
    <AuthProvider>
      <InterestProvider>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/my-interests" element={<MyInterests />} />
          <Route element={<AuthLayout />}>
            <Route path="/register/buyer" element={<BuyerRegister />} />
            <Route path="/register/marketer" element={<MarketerRegister />} />
            <Route path="/login" element={<Login />} />
          </Route>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="listings" element={<Listings />} />
            <Route path="leads" element={<Leads />} />
            <Route path="add-property" element={<AddProperty />} />
            <Route path="listings/:id/edit" element={<EditProperty />} />
          </Route>
        </Routes>
      </InterestProvider>
    </AuthProvider>
  )
}

export default App
