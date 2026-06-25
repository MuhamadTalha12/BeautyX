import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, MessageCircle, Phone, MapPin, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground mt-24">
      <div className="mx-auto max-w-7xl px-4 py-16 grid grid-cols-2 md:grid-cols-5 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex flex-col leading-none mb-4">
            <span className="font-serif text-2xl tracking-[0.25em]">BEAUTYX</span>
            <span className="text-[10px] tracking-[0.4em] opacity-70 mt-1">INTIMATES</span>
          </div>
          <p className="text-sm opacity-80 max-w-[16rem]">Premium lingerie & underwear brand for modern women.</p>
          <div className="flex gap-4 mt-6 opacity-90">
            <Instagram className="h-4 w-4" /><Facebook className="h-4 w-4" />
            <MessageCircle className="h-4 w-4" /><Phone className="h-4 w-4" /><Mail className="h-4 w-4" />
          </div>
        </div>
        <FooterCol title="Quick Links" links={[
          ["About Us", "/about"], ["Size Guide", "/size-guide"], ["Track Order", "/track-order"],
          ["Returns & Exchanges", "/returns-exchanges"], ["Contact Us", "/contact"],
        ]} />
        <FooterCol title="Customer Care" links={[
          ["Shipping Policy", "/shipping-policy"], ["Return Policy", "/return-policy"],
          ["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms"], ["FAQs", "/faqs"],
        ]} />
        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase opacity-90 mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm opacity-85">
            <li className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />+92 300 1234567</li>
            <li className="flex items-center gap-2"><Mail className="h-3.5 w-3.5" />hello@beautyx.com</li>
            <li className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />Lahore, Pakistan</li>
          </ul>
        </div>
        <div>
          <h4 className="text-[11px] tracking-[0.25em] uppercase opacity-90 mb-4">Newsletter</h4>
          <p className="text-sm opacity-80 mb-4">Subscribe to get special offers and updates.</p>
          <form className="flex items-center bg-background/10 rounded-full border border-primary-foreground/20 p-1">
            <input type="email" placeholder="Enter your email" className="flex-1 min-w-0 bg-transparent px-4 py-1.5 text-sm placeholder:text-primary-foreground/60 outline-none text-primary-foreground" />
            <button type="submit" className="shrink-0 p-2.5 bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition rounded-full flex items-center justify-center" aria-label="Subscribe">
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs opacity-75">
          <span>© 2026 BeautyX Intimates. All Rights Reserved.</span>

        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h4 className="text-[11px] tracking-[0.25em] uppercase opacity-90 mb-4">{title}</h4>
      <ul className="space-y-3 text-sm opacity-85">
        {links.map(([label, to]) => (
          <li key={to}><Link to={to} className="hover:opacity-100 hover:underline underline-offset-4">{label}</Link></li>
        ))}
      </ul>
    </div>
  );
}
