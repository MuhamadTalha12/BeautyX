import { Helmet } from "react-helmet-async";

import { PageShell, PageHero } from "@/components/site/PageShell";
import { Phone, Mail, MapPin } from "lucide-react";


export default function Contact() {
  return (
    <>
      <Helmet><title>Contact</title></Helmet>

    <PageShell>
      <PageHero title="Contact Us" subtitle="We'd love to hear from you." />
      <div className="mx-auto max-w-5xl px-4 py-16 grid md:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="flex items-start gap-3"><Phone className="h-5 w-5 text-primary mt-1" /><div><div className="font-medium">Phone</div><div className="text-muted-foreground text-sm">+92 300 1234567</div></div></div>
          <div className="flex items-start gap-3"><Mail className="h-5 w-5 text-primary mt-1" /><div><div className="font-medium">Email</div><div className="text-muted-foreground text-sm">hello@beautyx.com</div></div></div>
          <div className="flex items-start gap-3"><MapPin className="h-5 w-5 text-primary mt-1" /><div><div className="font-medium">Studio</div><div className="text-muted-foreground text-sm">Lahore, Pakistan</div></div></div>
        </div>
        <form className="space-y-4">
          <input className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Your name" />
          <input type="email" className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Email" />
          <textarea rows={5} className="w-full border border-border bg-background px-4 py-3 text-sm focus:border-primary outline-none" placeholder="Message" />
          <button className="w-full bg-primary text-primary-foreground py-3.5 text-[11px] tracking-[0.25em] uppercase hover:bg-primary/90">Send Message</button>
        </form>
      </div>
    </PageShell>

    </>
  );
}

