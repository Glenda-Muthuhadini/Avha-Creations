import { useRef } from 'react';
import { usePageTitle } from '../../hooks/usePageTitle';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import HeroSection from '../../components/home/HeroSection';
import BrandBenefits from '../../components/home/BrandBenefits';
import JourneySection from '../../components/home/JourneySection';
import CataloguePreview from '../../components/home/CataloguePreview';
import StorySection from '../../components/home/StorySection';
import SocialGallery from '../../components/home/SocialGallery';
import ContactCTA from '../../components/home/ContactCTA';

export default function HomePage() {
  usePageTitle('Handmade beauty & hair artistry');
  const root = useRef(null);
  useScrollReveal(root);
  return <div className="campaign-home" ref={root}>
    <HeroSection />
    <BrandBenefits />
    <div className="campaign-collections"><JourneySection /><CataloguePreview kind="products" /><CataloguePreview kind="services" /></div>
    <StorySection />
    <SocialGallery />
    <ContactCTA />
  </div>;
}
