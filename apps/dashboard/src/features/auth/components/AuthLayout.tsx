import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { Store } from "lucide-react";

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Shared visual shell for all auth pages (login/register/forgot/reset).
 * Features a premium split-screen design with vibrant colors and glassmorphism.
 */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 selection:bg-indigo-500/30">
      {/* Left side - Branding & Visuals (Hidden on small screens) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 bg-indigo-900 relative overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-950 opacity-90 z-0"></div>
        {/* Decorative background elements */}
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-purple-500/20 blur-[100px] mix-blend-screen z-0 animate-[pulse_10s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-0 right-0 w-3/4 h-3/4 rounded-tl-full bg-indigo-500/20 blur-[80px] mix-blend-screen z-0"></div>
        
        {/* Header/Logo */}
        <div className="relative z-10 flex items-center gap-3 transform transition-transform hover:scale-[1.02] duration-300 w-fit">
          <div className="h-12 w-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
            Sheba Tech
          </h1>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mt-auto mb-16 max-w-lg">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-[1.15]">
            Streamline your business operations.
          </h2>
          <p className="text-lg text-indigo-100/90 font-medium leading-relaxed">
            The ultimate point of sale solution for mobile & electronics shops. Manage inventory, sales, and staff with a state-of-the-art dashboard.
          </p>
        </div>
        
        {/* Footer */}
        <div className="relative z-10 flex items-center gap-4 text-sm text-indigo-200/50 font-medium">
          <span>© {new Date().getFullYear()} Sheba Tech. All rights reserved.</span>
        </div>
      </div>

      {/* Right side - Form Container */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <div className="absolute inset-0 bg-slate-50 dark:bg-slate-950 z-0" />
        
        {/* Mobile branding header */}
        <div className="relative z-10 mb-8 lg:hidden text-center flex flex-col items-center">
          <div className="h-14 w-14 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-xl shadow-indigo-600/20 mb-5">
            <Store className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Sheba Tech</h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">Point of sale for mobile & electronics shops</p>
        </div>

        <div className="w-full max-w-[420px] relative z-10">
          {/* Glassmorphism Card */}
          <Card className="border-0 shadow-2xl shadow-indigo-900/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl ring-1 ring-slate-200/50 dark:ring-slate-800/50 transition-all duration-500 hover:shadow-indigo-900/10 hover:ring-slate-200 dark:hover:ring-slate-700">
            <CardHeader className="space-y-2 pb-6 pt-8 px-8">
              <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{title}</CardTitle>
              {description ? <CardDescription className="text-[15px] text-slate-500">{description}</CardDescription> : null}
            </CardHeader>
            <CardContent className="space-y-5 px-8 pb-8">
              {children}
            </CardContent>
          </Card>
          {footer ? <div className="mt-8 text-center text-sm text-slate-500 font-medium">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}
