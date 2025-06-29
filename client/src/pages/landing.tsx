import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, CheckCircle, Users, Clock, TrendingUp } from "lucide-react";

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-xl mb-4">
            <Phone className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AI Receptionist</h1>
          <p className="text-slate-600 mt-2">Never miss a lead again</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg border border-slate-200">
          <CardContent className="p-8">
            {isLogin ? (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Welcome back</h2>
                  <p className="text-slate-600">Sign in to your account</p>
                </div>

                <div className="space-y-4">
                  <p className="text-sm text-slate-600 text-center">
                    Click below to sign in with your account
                  </p>
                  
                  <Button 
                    onClick={handleLogin}
                    className="w-full bg-primary hover:bg-primary-dark text-white"
                  >
                    Sign in
                  </Button>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-slate-600">
                    New to AI Receptionist?{" "}
                    <button 
                      onClick={() => setIsLogin(false)}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-2">Why Choose AI Receptionist?</h2>
                  <p className="text-slate-600">Your backup solution for missed calls</p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">Never Miss a Lead</h3>
                      <p className="text-sm text-slate-600">AI answers when you can't</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Users className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">Capture Every Detail</h3>
                      <p className="text-sm text-slate-600">Name, phone, service needs</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">24/7 Availability</h3>
                      <p className="text-sm text-slate-600">Always ready to help</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="h-5 w-5 text-accent mt-0.5" />
                    <div>
                      <h3 className="font-medium text-slate-900">SMS Notifications</h3>
                      <p className="text-sm text-slate-600">Instant lead alerts</p>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleLogin}
                  className="w-full bg-primary hover:bg-primary-dark text-white"
                >
                  Get Started Free
                </Button>

                <div className="mt-6 text-center">
                  <p className="text-slate-600">
                    Already have an account?{" "}
                    <button 
                      onClick={() => setIsLogin(true)}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
