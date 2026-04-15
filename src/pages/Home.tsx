
import Hero from "../components/Home/hero/Hero";
import WhyUs from "../components/Home/whyUs/WhyUs";
import Accreditation from "../components/Home/accreditation/Accreditation";
import ServicesSection from "../components/Home/servicesSection/ServicesSection";
import PmiSection from "../components/Home/pmiSection/PmiSection";
import CertificationScheme from "../components/Home/certificationScheme/CertificationScheme";
import PoliciesSection from "../components/Home/policiesSection/PoliciesSection";
import ClientsSection from "../components/Home/ClientsSection/ClientsSection";
import ContactForm from "../components/Home/ContactForm/ContactForm";


export default function Home() {
  return (
    <>
      <Hero/>
      <WhyUs/>
      <Accreditation/>
      <ServicesSection/>
      <PmiSection/>
      <CertificationScheme/>
      <PoliciesSection/>
      <ClientsSection/>
      <ContactForm/>
    </>
  );
}