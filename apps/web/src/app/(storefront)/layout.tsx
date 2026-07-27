import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SuggestionWidget from "@/components/SuggestionWidget";
import FestiveOfferWidget from "@/components/FestiveOfferWidget";

export default function StorefrontLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FestiveOfferWidget />
      <Header />
      {children}
      <Footer />
      <SuggestionWidget />
    </>
  );
}
