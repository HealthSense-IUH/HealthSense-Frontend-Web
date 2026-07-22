import { HeartPulse } from "lucide-react"
import { Link } from "react-router-dom"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#8a333d] text-white font-sans overflow-hidden flex flex-col relative selection:bg-white/30">
      
      {/* Background gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#7a2832] to-[#9b3842] opacity-80 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 w-full px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className="w-8 h-8 text-white/90 drop-shadow-md" />
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/80">
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Services</a>
          <a href="#" className="hover:text-white transition-colors">Medics</a>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link to="/login" className="text-white/80 hover:text-white transition-colors">Login</Link>
          <Link to="/register" className="text-white hover:opacity-80 transition-opacity">Register</Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-8 lg:px-16 pb-12">
        <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-center h-full">
          
          {/* Left Content (Text) */}
          <div className="col-span-1 lg:col-span-4 flex flex-col justify-center order-2 lg:order-1 mt-8 lg:mt-0 z-20">
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-bold leading-[1.1] mb-6 tracking-tight drop-shadow-sm">
              TAKE CARE OF YOUR <br /> HEART DISEASES
            </h1>
            <p className="text-white/80 text-sm md:text-base mb-8 max-w-[400px] leading-relaxed">
              It keeps running 24/7, non-stop, always by your side. 
              Give a damn about your heart.
            </p>
            
            <ul className="space-y-3 mb-10 text-white/90 text-sm font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white" />
                Interactive 3D heart model
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white" />
                Expert heart health insights
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-white" />
                Personalized health tracking tools
              </li>
            </ul>
            
            <Link to="/register" className="self-start bg-[#f1d4d8] text-[#7a2832] font-semibold px-8 py-3.5 rounded-full hover:bg-white transition-colors shadow-lg shadow-black/10">
              Get In touch
            </Link>
          </div>

          {/* Center Content (3D Heart) */}
          <div className="col-span-1 lg:col-span-8 relative h-[400px] md:h-[550px] lg:h-[700px] flex items-center justify-center order-1 lg:order-2 w-full max-w-[800px] mx-auto">
            {/* The 3D Glass Heart Image */}
            <img 
              src="/images/3d_glass_heart.png" 
              alt="3D Glass Heart" 
              className="absolute w-full max-w-[550px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-700 ease-out z-10"
              style={{ filter: "drop-shadow(0 25px 35px rgba(0,0,0,0.3))" }}
            />

            {/* Glassmorphism Tags */}
            {/* Top Left Tag */}
            <div className="absolute top-[20%] left-[5%] lg:-left-[5%] z-20">
              <div className="glass-card px-4 py-3 rounded-2xl flex flex-col gap-1 w-[160px]">
                <span className="text-sm font-semibold text-white">Stay Active</span>
                <span className="text-[9px] text-white/70 leading-tight">30 minutes of daily exercise strengthens your heart.</span>
              </div>
              {/* Line connector */}
              <div className="hidden lg:block absolute top-1/2 left-full w-24 border-t border-white/40" />
            </div>

            {/* Top Right Tag */}
            <div className="absolute top-[25%] right-[5%] lg:right-[0%] z-20">
              {/* Line connector */}
              <div className="hidden lg:block absolute top-1/2 right-full w-24 border-t border-white/40" />
              <div className="glass-card px-4 py-3 rounded-2xl flex flex-col gap-1 w-[160px]">
                <span className="text-sm font-semibold text-white">Right Atrium</span>
                <span className="text-[9px] text-white/70 leading-tight">Receives oxygen-poor blood from the body.</span>
              </div>
            </div>

            {/* Middle Right Tag */}
            <div className="absolute top-[45%] right-[2%] lg:-right-[5%] z-20">
              {/* Line connector */}
              <div className="hidden lg:block absolute top-1/2 right-full w-32 border-t border-white/40" />
              <div className="glass-card px-4 py-3 rounded-2xl flex flex-col gap-1 w-[160px]">
                <span className="text-sm font-semibold text-white">Right Ventricle</span>
                <span className="text-[9px] text-white/70 leading-tight">Pumps oxygen-poor blood to the lungs.</span>
              </div>
            </div>

            {/* Bottom Right Tag */}
            <div className="absolute bottom-[20%] right-[0%] lg:-right-[10%] z-20">
              {/* Line connector */}
              <div className="hidden lg:block absolute top-1/2 right-full w-16 border-t border-white/40" />
              <div className="glass-card px-4 py-3 rounded-2xl flex flex-col gap-1 w-[160px]">
                <span className="text-sm font-semibold text-white">Check Regularly</span>
                <span className="text-[9px] text-white/70 leading-tight">Routine check-ups prevent heart diseases.</span>
              </div>
            </div>

            {/* Bottom Center Tag */}
            <div className="absolute bottom-[10%] right-[30%] lg:right-[15%] z-20">
               {/* Line connector */}
               <div className="hidden lg:block absolute bottom-full right-1/2 h-16 border-l border-white/40" />
              <div className="glass-card px-4 py-3 rounded-2xl flex flex-col gap-1 w-[160px]">
                <span className="text-sm font-semibold text-white">Eat Smart</span>
                <span className="text-[9px] text-white/70 leading-tight">A balanced diet is the key to a healthy heart.</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Stats Section */}
      <footer className="relative z-10 w-full px-8 lg:px-16 pb-8 pt-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 md:gap-4 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-1">
            <h4 className="text-xl md:text-2xl font-bold tracking-tight">100,000 Beats</h4>
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="w-1 h-1 rounded-full bg-white" />
              Your heart beats 100,000 times daily.
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <h4 className="text-xl md:text-2xl font-bold tracking-tight">2,000 Gallons</h4>
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="w-1 h-1 rounded-full bg-white" />
              It pumps 2,000 gallons of blood every day.
            </div>
          </div>
          
          <div className="flex flex-col gap-1">
            <h4 className="text-xl md:text-2xl font-bold tracking-tight">1 in 4 Deaths</h4>
            <div className="flex items-center gap-1.5 text-xs text-white/80">
              <span className="w-1 h-1 rounded-full bg-white" />
              Heart disease accounts for 1 in 4 deaths globally.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
