import { LoadingScreen } from '@/components/frankies-cake/layout/LoadingScreen';
import { SiteHeader } from '@/components/frankies-cake/layout/SiteHeader';
import { MobileMenu } from '@/components/frankies-cake/layout/MobileMenu';
import { SiteFooter } from '@/components/frankies-cake/layout/SiteFooter';
import { Hero } from '@/components/frankies-cake/home/Hero';
import { CakesShowcase } from '@/components/frankies-cake/home/CakesShowcase';
import { Collections } from '@/components/frankies-cake/home/Collections';
import { CustomCakeSection } from '@/components/frankies-cake/home/CustomCakeSection';
import { Testimonials } from '@/components/frankies-cake/home/Testimonials';
import { InstagramGallery } from '@/components/frankies-cake/home/InstagramGallery';
import { AboutSection } from '@/components/frankies-cake/home/AboutSection';
import { CartDrawer } from '@/components/frankies-cake/cart/CartDrawer';
import { FlyToCart } from '@/components/frankies-cake/cart/FlyToCart';
import { AddedToast } from '@/components/frankies-cake/cart/AddedToast';

export default function FrankiesCakePage() {
  return (
    <>
      <LoadingScreen />
      <SiteHeader />
      <MobileMenu />

      <main>
        <Hero />
        <CakesShowcase />
        <Collections />
        <CustomCakeSection />
        <AboutSection />
        <Testimonials />
        <InstagramGallery />
      </main>

      <SiteFooter />

      <CartDrawer />
      <FlyToCart />
      <AddedToast />
    </>
  );
}
