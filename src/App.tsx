import { useEffect } from "react";
import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Background } from "./components/Background";
import { Work } from "./components/Work";
import { AgentLab } from "./components/AgentLab";
import { MomentBand } from "./components/MomentBand";
import { Experience } from "./components/Experience";
import { Toolkit } from "./components/Toolkit";
import { Contact } from "./components/Contact";
import { Faq } from "./components/Faq";
import { Footer } from "./components/Footer";

export default function App() {
  // Opt into JS-driven reveal transitions only when JS is running.
  useEffect(() => {
    document.documentElement.classList.add("js");
    // Safety net: never leave a section hidden if IntersectionObserver
    // doesn't fire (background tabs, headless crawlers, screenshot bots).
    const t = window.setTimeout(() => {
      document
        .querySelectorAll(".reveal:not(.is-in)")
        .forEach((el) => el.classList.add("is-in"));
    }, 1400);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-[var(--accent-ink)]"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main">
        <Hero />
        <Background />
        <Work />
        <AgentLab />
        <MomentBand />
        <Experience />
        <Toolkit />
        <Contact />
        <Faq />
      </main>

      <Footer />

      <div className="grain" aria-hidden />

    </>
  );
}
