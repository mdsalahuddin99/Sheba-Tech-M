"use client";

import { usePageTitle } from "@/shared/hooks/usePageTitle";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Phone, Mail, Globe, MapPin, Info, Code2, HeadphonesIcon, Facebook, Twitter, Linkedin, Instagram } from "lucide-react";
import { PageHeader } from "@/shared/components";

export default function HelpClient() {
  usePageTitle("Help & Support");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <PageHeader
        title="Help & Support"
        description="Get assistance and learn more about Tech Baria POS system."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <Card className="p-6 md:p-8 space-y-6 border-primary/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-bl-[100px] -z-10" />

          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-primary grid place-items-center text-white shadow-lg shadow-primary/20 shrink-0">
              <Code2 className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">Amar Tech BD</h2>
              <p className="text-sm text-muted-foreground font-medium">Software & Technology Solutions</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Amar Tech BD is a leading software development company specializing in modern Point of Sale (POS), Inventory Management, and E-commerce solutions. We build robust, scalable, and beautifully designed web applications tailored to your business needs.
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-2">Contact Information</h3>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <span className="font-medium">01846715474</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary shrink-0">
                <Mail className="h-4 w-4" />
              </div>
              <span className="font-medium">hello.salah.dev@gmail.com</span>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <a href="https://tech.amartalim.com" target="_blank" rel="noreferrer" className="font-medium text-primary hover:underline">
                www.tech.amartalim.com
              </a>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-primary/10 grid place-items-center text-primary shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <span className="font-medium">Haji Tower, Aruail, Srail, Brahman baria</span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border/50">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Follow Us</h3>
            <div className="flex items-center gap-3">
              <a href="#" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary grid place-items-center transition-colors">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary grid place-items-center transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary grid place-items-center transition-colors">
                <Linkedin className="h-4 w-4" />
              </a>
              <a href="#" target="_blank" rel="noreferrer" className="h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary grid place-items-center transition-colors">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {/* Quick Support */}
          <Card className="p-6 border-emerald-500/10 shadow-sm relative overflow-hidden bg-gradient-to-br from-card to-emerald-50/30 dark:to-emerald-900/10">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 grid place-items-center text-emerald-600 shrink-0 mt-1">
                <HeadphonesIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Need Immediate Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our support team is available to help you with any issues you might face with the POS system. Call us directly for urgent assistance.
                </p>
                <div className="flex gap-2">
                  <a href="tel:01846715474">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20">
                      <Phone className="h-4 w-4 mr-2" /> Call Support
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* System Info */}
          <Card className="p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> System Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Software Name</span>
                <span className="font-semibold">Tech Baria POS</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Version</span>
                <span className="font-semibold font-mono">v2.1.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">License Type</span>
                <span className="font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full text-xs">Premium Server License for 1 Year</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50 text-sm">
                <span className="text-muted-foreground">Developer</span>
                <span className="font-medium">Amar Tech BD</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

