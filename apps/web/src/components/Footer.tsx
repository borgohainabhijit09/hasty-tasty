import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-white text-[#3A1E14]">
      {/* Main Footer Body */}
      <div className="max-w-[1260px] mx-auto px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Col 1 — Brand */}
          <div className="space-y-4 col-span-2 md:col-span-1">
            <div className="relative w-24 h-10">
              <Image
                src="/images/logo.png"
                alt="Hasty Tasty Logo"
                fill
                sizes="96px"
                className="object-contain object-left"
              />
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">
              Premium Food.<br />Exceptional Taste.<br />Crafted with Pride.
            </p>
            {/* Social icons */}
            <div className="flex justify-center md:justify-start gap-3 pt-1">
              {[
                { label: "IG", href: "https://instagram.com" },
                { label: "FB", href: "https://facebook.com" },
                { label: "WA", href: "https://wa.me/919864402305" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 hover:bg-[#C89F5F] hover:text-white hover:border-[#C89F5F] cursor-pointer transition-colors"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Shop */}
          <div className="space-y-4">
            <h4 className="text-[#C89F5F] text-[10px] font-bold uppercase tracking-[0.2em]">Shop</h4>
            <ul className="space-y-2.5">
              {["Cakes", "Cookies", "Pastries", "Breads", "Gift Hampers"].map((item) => (
                <li key={item}>
                  <Link href={`/shop?category=${item.toLowerCase().replace(" ", "-")}`} className="text-gray-500 text-xs hover:text-[#C89F5F] transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — B2B Wholesale */}
          <div className="space-y-4">
            <h4 className="text-[#C89F5F] text-[10px] font-bold uppercase tracking-[0.2em]">B2B Wholesale</h4>
            <ul className="space-y-2.5">
              {[
                { label: "B2B Portal",   href: "/b2b" },
                { label: "Register Partner", href: "/signup?b2b=true" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 text-xs hover:text-[#C89F5F] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — My Account */}
          <div className="space-y-4">
            <h4 className="text-[#C89F5F] text-[10px] font-bold uppercase tracking-[0.2em]">My Account</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Dashboard",   href: "/account" },
                { label: "My Orders",    href: "/account/orders" },
                { label: "My Addresses", href: "/account/addresses" },
                { label: "Account Details", href: "/account/details" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 text-xs hover:text-[#C89F5F] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5 — Company */}
          <div className="space-y-4">
            <h4 className="text-[#C89F5F] text-[10px] font-bold uppercase tracking-[0.2em]">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us",   href: "/about" },
                { label: "Contact Us", href: "/contact" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-gray-500 text-xs hover:text-[#C89F5F] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Bottom Bar */}
      <div className="max-w-[1260px] mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <p className="text-[11px] text-gray-500">&copy; 2026 Hasty Tasty. All Rights Reserved.</p>
        <p className="text-[11px] text-gray-500">
          Beautifully designed by <a href="https://sygmiainnovative.co.in/" target="_blank" rel="noopener noreferrer" className="hover:text-[#C89F5F] transition-colors underline underline-offset-2">Sygmia Innovative</a>
        </p>
      </div>
    </footer>
  );
}
