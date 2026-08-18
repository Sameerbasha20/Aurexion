import React from "react";
import { Link } from "wouter";
import { MapPin, Navigation } from "lucide-react";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-background pt-12 pb-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          
          {/* Col 1: Brand & Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl font-bold tracking-tighter text-primary">AUREXION</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              Leading provider of enterprise solutions, driving digital transformation and innovation across industries worldwide.
            </p>
          </div>

          {/* Col 2: Company */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/why-us" className="hover:text-primary transition-colors">Why Choose Us</Link></li>
              <li><Link href="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="/insights" className="hover:text-primary transition-colors">Insights</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Solutions */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Solutions</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/services" className="hover:text-primary transition-colors">Services</Link></li>
              <li><Link href="/industries" className="hover:text-primary transition-colors">Industries</Link></li>
              <li><Link href="/case-studies" className="hover:text-primary transition-colors">Case Studies</Link></li>
              <li><Link href="/estimator" className="hover:text-primary transition-colors">Project Estimator</Link></li>
              <li><Link href="/rfp" className="hover:text-primary transition-colors">Submit RFP</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Security */}
          <div>
            <h3 className="font-semibold text-foreground mb-4 text-sm uppercase tracking-wider">Legal &amp; Security</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              <li><Link href="/security" className="hover:text-primary transition-colors">Security Governance</Link></li>
            </ul>
          </div>

          {/* Col 5: Location Map */}
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Our Location</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
              100 Innovation Way, Suite 400<br />
              San Francisco, CA 94105
            </p>
            <div className="relative w-full h-32 rounded-lg overflow-hidden border border-border/40 group shadow-sm bg-card">
              <iframe
                title="Aurexion Global Headquarters Location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0863821034444!2d-122.39801868468205!3d37.78917197975641!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085807ab087e5eb%3A0x6b771e8471c26026!2sFinancial%20District%2C%20San%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1689000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0, filter: "invert(90%) hue-rotate(180%) contrast(1.2) brightness(0.85)" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
              />
              <a
                href="https://maps.google.com/?q=100+Innovation+Way,+San+Francisco,+CA+94105"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-2 right-2 bg-background/90 hover:bg-background border border-border/60 text-primary text-[10px] px-2 py-1 rounded flex items-center gap-1 font-mono transition-colors shadow-sm"
              >
                <Navigation className="h-3 w-3" />
                Directions
              </a>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="border-t border-border/40 pt-8 mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} Aurexion Technologies. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/cookie-policy" className="hover:text-primary transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
