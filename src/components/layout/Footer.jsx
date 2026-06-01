import { Link } from 'react-router-dom'
import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-farm-green text-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 font-bold text-xl mb-3">
            <Leaf className="w-5 h-5 text-farm-amber" />
            <span>BarnCart</span>
          </div>
          <p className="text-farm-greenMuted text-sm leading-relaxed">
            Fresh produce sourced in small batches.<br />
            Limited stock. Always real.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-farm-amber mb-4">Quick Links</h3>
          <ul className="flex flex-col gap-2 text-sm text-farm-greenMuted">
            <li><Link to="/listings" className="hover:text-white transition-colors">Shop</Link></li>
            <li><Link to="/orders" className="hover:text-white transition-colors">My Orders</Link></li>
            <li><Link to="/cart" className="hover:text-white transition-colors">Cart</Link></li>
            <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-farm-amber mb-4">Info</h3>
          <ul className="flex flex-col gap-2 text-sm text-farm-greenMuted">
            <li>Fresh harvests weekly</li>
            <li>Delivery: Morning & Evening slots</li>
            <li>Canada — CAD pricing</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-farm-greenLight">
        <div className="max-w-6xl mx-auto px-4 py-4 text-xs text-farm-greenMuted text-center">
          © {new Date().getFullYear()} BarnCart. All rights reserved.
        </div>
      </div>
    </footer>
  )
}