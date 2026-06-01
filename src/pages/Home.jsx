import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getListings } from '../api/listings'
import ListingCard from '../components/listing/ListingCard'
import { Leaf, Truck, ShieldCheck, ArrowRight, Sprout, Zap, Clock, TrendingDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    //check if already in view on mount
    if(ref.current) {
        const rect = ref.current.getBoundingClientRect()
        if(rect.top < window.innerHeight) {
            setInView(true)
            return
        }
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true)
        observer.disconnect()
      }
    }, { threshold: 0.1, ...options })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return [ref, inView]
}

function useCountUp(target, duration = 1200, trigger = false) {
  const [value, setValue] = useState(0)
  const frame = useRef(null)
  useEffect(() => {
    if (!trigger) return
    let start = null
    const step = (timestamp) => {
      if (!start) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      setValue(Math.floor(progress * target))
      if (progress < 1) frame.current = requestAnimationFrame(step)
      else setValue(target)
    }
    frame.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame.current)
  }, [trigger, target, duration])
  return value
}

function HeroSection({ user, listingCount }) {
  const [visible, setVisible] = useState(false)
  const [statsRef, statsInView] = useInView()
  const countOrders = useCountUp(247, 1500, statsInView)
  const countBatches = useCountUp(12, 1000, statsInView)
  const countFresh = useCountUp(100, 1200, statsInView)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative overflow-hidden text-white"
      style={{ background: 'linear-gradient(135deg, #1a4a35 0%, #2D6A4F 55%, #3d8a65 100%)' }}>
      {/* Dot pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />

      <div className="relative max-w-6xl mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16
        flex flex-col md:flex-row items-center gap-12">

        {/* Left — text */}
        <div className={`flex-1 text-center md:text-left transition-all duration-700
          ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Live badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
            text-farm-greenMuted text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {listingCount > 0
              ? `${listingCount} fresh batch${listingCount > 1 ? 'es' : ''} available now`
              : 'Small batch. Always fresh.'}
          </div>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-5">
            Farm fresh produce<br />
            <span className="relative text-farm-amber">
              delivered to your door
              <svg className="absolute -bottom-1 left-0 w-full" height="4" viewBox="0 0 300 4">
                <path d="M0 2 Q150 0 300 2" stroke="#F4A261" strokeWidth="2"
                  fill="none" strokeLinecap="round"
                  className={`transition-all duration-1000 delay-500
                    ${visible ? 'opacity-40' : 'opacity-0'}`} />
              </svg>
            </span>
          </h1>

          <p className="text-farm-greenMuted text-base leading-relaxed mb-8
            max-w-md mx-auto md:mx-0">
            We harvest in small batches so you always get produce at peak freshness.
            Stock is live — when it's gone, it's gone.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link to="/listings"
              className="flex items-center justify-center gap-2 bg-farm-amber
                text-farm-text font-semibold px-6 py-3 rounded-lg
                hover:bg-farm-amberLight transition-all hover:shadow-lg hover:-translate-y-0.5">
              Shop Now <ArrowRight size={16} />
            </Link>
            {!user ? (
              <Link to="/register"
                className="flex items-center justify-center gap-2 border border-white/30
                  text-white font-medium px-6 py-3 rounded-lg
                  hover:bg-white/10 transition-all backdrop-blur-sm">
                Create Account
              </Link>
            ) : (
              <Link to="/orders"
                className="flex items-center justify-center gap-2 border border-white/30
                  text-white font-medium px-6 py-3 rounded-lg
                  hover:bg-white/10 transition-all backdrop-blur-sm">
                My Orders
              </Link>
            )}
          </div>
        </div>

        {/* Right — animated stat ring */}
        <div className={`flex-1 flex justify-center md:justify-end transition-all duration-1000
          delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div ref={statsRef} className="relative w-72 h-72 md:w-80 md:h-80">
            {/* Rings */}
            <div className="absolute inset-0 bg-white/5 rounded-full" />
            <div className="absolute inset-8 bg-white/5 rounded-full" />
            <div className="absolute inset-16 bg-white/5 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Leaf className="w-24 h-24 text-farm-amber opacity-15" />
            </div>

            {/* Stat — top right */}
            <div className={`absolute -top-2 right-0 bg-white text-farm-text
              rounded-xl px-4 py-3 shadow-xl text-center min-w-[90px]
              transition-all duration-700 delay-500
              ${statsInView ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
              <p className="text-2xl font-bold text-farm-green">{countOrders}</p>
              <p className="text-xs text-gray-400">Orders Delivered</p>
            </div>

            {/* Stat — bottom left */}
            <div className={`absolute -bottom-2 left-0 bg-white text-farm-text
              rounded-xl px-4 py-3 shadow-xl text-center min-w-[90px]
              transition-all duration-700 delay-700
              ${statsInView ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
              <p className="text-2xl font-bold text-farm-green">{countBatches}</p>
              <p className="text-xs text-gray-400">Batches This Season</p>
            </div>

            {/* Stat — bottom right */}
            <div className={`absolute bottom-8 -right-4 bg-farm-amber text-farm-text
              rounded-xl px-4 py-3 shadow-xl text-center min-w-[80px]
              transition-all duration-700 delay-900
              ${statsInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <p className="text-2xl font-bold">{countFresh}%</p>
              <p className="text-xs">Farm Fresh</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="relative h-12 md:h-16">
        <svg viewBox="0 0 1440 64" className="absolute bottom-0 w-full"
          preserveAspectRatio="none">
          <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z"
            fill="#FAFAF8" />
        </svg>
      </div>
    </section>
  )
}

function LiveStockBanner({ listings }) {
  if (listings.length === 0) return null
  const lowStock = listings.filter(l => l.lowStock)

  return (
    <section className="bg-farm-bg border-b border-gray-100 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1.5 text-xs font-semibold
            text-farm-green shrink-0">
            <Zap size={12} className="text-farm-amber" />
            Live Stock
          </div>
          <div className="w-px h-4 bg-gray-200 shrink-0" />
          {listings.map(l => (
            <div key={l.listingId}
              className="flex items-center gap-2 bg-white border border-gray-100
                rounded-full px-3 py-1 text-xs shrink-0 shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0
                ${l.lowStock ? 'bg-farm-amber animate-pulse' : 'bg-farm-green'}`} />
              <span className="font-medium text-farm-text">{l.produceName}</span>
              <span className="text-gray-400">{l.quantityAvailable} left</span>
            </div>
          ))}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-farm-amber
              font-medium shrink-0 ml-2">
              <TrendingDown size={12} />
              {lowStock.length} running low
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function FeaturedListings({ listings, loading }) {
  const [ref, inView] = useInView()
  return (
    <section className="py-16 md:py-20 bg-farm-bg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-farm-text mb-1">
              Fresh right now
            </h2>
            <p className="text-gray-500 text-sm">
              Live inventory — stock updates in real time
            </p>
          </div>
          <Link to="/listings"
            className="flex items-center gap-1 text-farm-green text-sm
              font-medium hover:text-farm-greenLight transition-colors">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl aspect-[3/4] animate-pulse" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            No listings available right now. Check back soon.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {listings.map(listing => (
                <ListingCard key={listing.listingId} listing={listing}/>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function HowItWorksSection() {
  const [ref, inView] = useInView()
  const steps = [
    { number: '01', title: 'Browse Fresh Batches', icon: Sprout,
      desc: "Each listing is a real harvest batch with live stock. When it's gone, it's gone." },
    { number: '02', title: 'Pick a Delivery Slot', icon: Clock,
      desc: 'Choose a morning or evening slot. Capacity is limited — book early.' },
    { number: '03', title: 'Pay Securely', icon: ShieldCheck,
      desc: 'Stripe handles payment. Your stock is reserved while you check out.' },
    { number: '04', title: 'Receive Fresh Produce', icon: Truck,
      desc: 'Packed fresh for your slot. Track your order status in real time.' },
  ]

  return (
    <section className="py-16 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-farm-text mb-3">
            How it works
          </h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            From harvest to your door — four simple steps.
          </p>
        </div>
        <div ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%]
            h-px bg-farm-greenMuted z-0" />
          {steps.map(({ number, title, icon: Icon, desc }, i) => (
            <div key={number}
              className="relative z-10 flex flex-col items-center text-center
                lg:items-start lg:text-left gap-3 transition-all duration-500"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(20px)',
                transitionDelay: `${i * 120}ms`
              }}>
              <div className="w-12 h-12 bg-farm-greenMuted rounded-full
                flex items-center justify-center shrink-0 border-2 border-white
                shadow-sm">
                <Icon size={20} className="text-farm-green" />
              </div>
              <span className="text-xs font-bold text-farm-amber tracking-widest">
                {number}
              </span>
              <h3 className="font-semibold text-farm-text">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function TrustSection() {
  const [ref, inView] = useInView()
  const points = [
    { icon: Leaf, title: 'Small Batch Harvests',
      desc: 'We harvest only what we can deliver fresh. No cold storage, no compromises.' },
    { icon: Truck, title: 'Morning & Evening Slots',
      desc: 'Two delivery windows daily. Pick what fits your schedule.' },
    { icon: ShieldCheck, title: 'Secure Checkout',
      desc: 'Stripe-powered payments. Stock reserved while you pay — no overselling.' },
  ]

  return (
    <section className="py-16 bg-farm-bg border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {points.map(({ icon: Icon, title, desc }, i) => (
            <div key={title}
              className="flex gap-4 p-6 bg-white rounded-xl border border-gray-100
                shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(16px)',
                transitionDelay: `${i * 150}ms`
              }}>
              <div className="w-10 h-10 bg-farm-greenMuted rounded-lg
                flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={18} className="text-farm-green" />
              </div>
              <div>
                <h3 className="font-semibold text-farm-text mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection({ user }) {
  const [ref, inView] = useInView()
  return (
    <section className="py-16 text-white relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #1a4a35 0%, #2D6A4F 60%, #3d8a65 100%)' }}>
      <div className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px'
        }} />
      <div ref={ref}
        className="relative max-w-2xl mx-auto px-4 text-center transition-all duration-700"
        style={{
          opacity: inView ? 1 : 0,
          transform: inView ? 'translateY(0)' : 'translateY(24px)'
        }}>
        <div className="inline-flex items-center gap-2 bg-white/10 text-farm-greenMuted
          text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Sprout size={12} />
          Fresh harvests every week
        </div>
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to eat fresher?
        </h2>
        <p className="text-farm-greenMuted text-sm mb-8 leading-relaxed max-w-md mx-auto">
          Join BarnCart and get access to small-batch harvests before they sell out.
          Real stock. Real freshness. Free to sign up.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {!user ? (
            <>
              <Link to="/register"
                className="bg-farm-amber text-farm-text font-semibold px-6 py-3
                  rounded-lg hover:bg-farm-amberLight transition-all
                  hover:shadow-lg hover:-translate-y-0.5">
                Get Started — It's Free
              </Link>
              <Link to="/listings"
                className="border border-white/30 text-white font-medium px-6 py-3
                  rounded-lg hover:bg-white/10 transition-all">
                Browse Listings
              </Link>
            </>
          ) : (
            <>
              <Link to="/listings"
                className="bg-farm-amber text-farm-text font-semibold px-6 py-3
                  rounded-lg hover:bg-farm-amberLight transition-all
                  hover:shadow-lg hover:-translate-y-0.5">
                Shop Now
              </Link>
              <Link to="/orders"
                className="border border-white/30 text-white font-medium px-6 py-3
                  rounded-lg hover:bg-white/10 transition-all">
                My Orders
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default function Home() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    getListings(0, 4)
      .then(res => setListings(res.data.content ?? res.data))
      .catch(() => setListings([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <HeroSection user={user} listingCount={listings.length} />
      {!loading && <LiveStockBanner listings={listings} />}
      <FeaturedListings listings={listings} loading={loading} />
      <HowItWorksSection />
      <TrustSection />
      <CTASection user={user} />
    </div>
  )
}