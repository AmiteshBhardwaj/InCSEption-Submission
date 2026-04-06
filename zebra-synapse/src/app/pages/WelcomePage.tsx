import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Stethoscope, User, Heart } from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 font-inter">
      {/* Radial glows */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl"></div>

      {/* ECG Animation */}
      <svg className="absolute bottom-10 left-10 w-64 h-16 opacity-10" viewBox="0 0 400 50">
        <path
          d="M0,25 L50,25 L55,10 L60,40 L65,25 L100,25 L105,15 L110,35 L115,25 L200,25 L205,20 L210,30 L215,25 L300,25 L305,18 L310,32 L315,25 L400,25"
          stroke="#10b981"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
      </svg>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <Heart className="w-10 h-10 text-green-600" strokeWidth={1.5} />
              <h1 className="text-6xl font-[Playfair_Display] font-bold text-gray-800 tracking-tight">Zebra Synapse</h1>
            </div>
            <p className="text-xl text-gray-600 font-inter font-light">AI-Powered Healthcare Management Platform</p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Patient Portal Card */}
            <div className="relative group">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-emerald-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative backdrop-blur-xl bg-white/35 border border-white/30 rounded-3xl shadow-2xl p-8 flex flex-col justify-between min-h-[400px] hover:scale-105 transition-all duration-500 animate-fade-in-up delay-200">
                <div className="flex flex-col items-center text-center flex-grow">
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-green-100/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <User className="w-8 h-8 text-green-700" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-inter font-semibold text-gray-800 mb-4">Patient Portal</h2>
                  <p className="text-gray-600 font-inter leading-relaxed flex-grow">
                    Access your personalized health insights, lab reports, and wellness recommendations powered by AI.
                  </p>
                </div>
                <div className="space-y-4 mt-8">
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-inter font-medium transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate("/login/patient")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50 py-3 rounded-xl font-inter font-medium transition-all duration-300"
                    onClick={() => navigate("/signup/patient")}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>

            {/* Doctor Portal Card */}
            <div className="relative group">
              {/* Glow behind card */}
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-green-400/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative backdrop-blur-xl bg-white/35 border border-white/30 rounded-3xl shadow-2xl p-8 flex flex-col justify-between min-h-[400px] hover:scale-105 transition-all duration-500 animate-fade-in-up delay-400">
                <div className="flex flex-col items-center text-center flex-grow">
                  <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-emerald-100/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <Stethoscope className="w-8 h-8 text-emerald-700" strokeWidth={1.5} />
                    </div>
                  </div>
                  <h2 className="text-3xl font-inter font-semibold text-gray-800 mb-4">Doctor Portal</h2>
                  <p className="text-gray-600 font-inter leading-relaxed flex-grow">
                    Manage patient care, analyze health data, and provide AI-assisted medical insights.
                  </p>
                </div>
                <div className="space-y-4 mt-8">
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-inter font-medium transition-all duration-300 hover:shadow-lg"
                    onClick={() => navigate("/login/doctor")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 py-3 rounded-xl font-inter font-medium transition-all duration-300"
                    onClick={() => navigate("/signup/doctor")}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
