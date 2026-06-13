import SmoothScroll from './components/layout/SmoothScroll'
import Nav from './components/layout/Nav'
import Footer from './components/layout/Footer'
import ParticleBackground from './components/effects/ParticleBackground'

import Hero from './components/sections/Hero'
import RecruiterSnapshot from './components/sections/RecruiterSnapshot'
import About from './components/sections/About'
import Skills from './components/sections/Skills'
import Timeline from './components/sections/Timeline'
import FeaturedProject from './components/sections/FeaturedProject'
import Projects from './components/sections/Projects'
import Leadership from './components/sections/Leadership'
import GithubIntel from './components/sections/GithubIntel'
import Assistant from './components/sections/Assistant'
import Contact from './components/sections/Contact'

export default function App() {
  return (
    <SmoothScroll>
      <ParticleBackground />
      <Nav />
      <main>
        <Hero />
        <RecruiterSnapshot />
        <About />
        <Skills />
        <Timeline />
        <FeaturedProject />
        <Projects />
        <Leadership />
        <GithubIntel />
        <Assistant />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  )
}
