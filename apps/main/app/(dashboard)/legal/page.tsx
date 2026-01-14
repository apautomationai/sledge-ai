import { Scale, Sparkles } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 w-full">
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Legal</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your legal documents and compliance.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-[#D4AF37]/10 rounded-full blur-2xl" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-[#D4AF37]/20 to-[#D4AF37]/5 border border-[#D4AF37]/20">
            <Scale className="h-10 w-10 text-[#D4AF37]" />
          </div>
        </div>

        <div className="flex items-center gap-2 mt-6 mb-3">
          <Sparkles className="h-4 w-4 text-[#D4AF37]" />
          <span className="text-sm font-medium text-[#D4AF37]">Coming Soon</span>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">Something Great is Brewing</h2>
        <p className="text-muted-foreground text-center max-w-sm">
          Powerful legal management tools are on the way. We'll notify you when it's ready.
        </p>
      </div>
    </div>
  );
}
