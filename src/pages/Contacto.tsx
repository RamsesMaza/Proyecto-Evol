import ContactCards from "../components/Contacto/ContactCards/ContactCards"
import ContactHero from "../components/Contacto/ContactHero/ContactHero"
import ContactMainSection from "../components/Contacto/ContactMainSection/ContactMainSection"
import ContactMap from "../components/Contacto/ContactMap/ContactMap"

const Contacto = () => {
  return (
    <div>
      <ContactHero/>
      <ContactCards/>
      <ContactMainSection/>
      <ContactMap/>
    </div>
  )
}

export default Contacto
