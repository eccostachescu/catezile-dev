import Container from "@/components/Container";
import { SEO } from "@/seo/SEO";
import { getInitialData } from "@/ssg/serialize";
import { useState } from "react";
import Hero from "@/components/home/Hero";
import SearchDialog from "@/components/home/SearchDialog";
import FeaturedTimers from "@/components/home/FeaturedTimers";
import MatchesStrip from "@/components/home/MatchesStrip";
import MoviesStrip from "@/components/home/MoviesStrip";
import SectionList from "@/components/home/SectionList";
import WeekAhead from "@/components/home/WeekAhead";
import NewsletterCta from "@/components/home/NewsletterCta";
import HomeAdRail from "@/components/home/HomeAdRail";
import LazySection from "@/components/home/LazySection";
import { FeaturedSkeleton, GridSkeleton } from "@/components/home/Skeletons";

function AnswerBox() {
  return (
    <section className="py-4">
      <Container>
        <p className="text-center text-sm text-muted-foreground">
          Află rapid în câte zile sunt evenimentele importante, ce meciuri sunt la TV și când apar filmele în România.
        </p>
      </Container>
    </section>
  );
}

export default function Home() {
  const data = getInitialData<any>();
  const home = data && (data as any).home;
  const [openSearch, setOpenSearch] = useState(false);
  return (
    <>
      <SEO kind="home" title="CateZile.ro — Câte zile până…" description="Calendar inteligent pentru România: meciuri Liga 1, filme, sărbători, examene, festivaluri și Black Friday." path="/" />
      <Hero onOpenSearch={() => setOpenSearch(true)} />
      <SearchDialog open={openSearch} onOpenChange={setOpenSearch} />

      <AnswerBox />

      <FeaturedTimers events={home?.featured?.events || []} />

      <LazySection placeholder={<section className="py-6"><Container><FeaturedSkeleton /></Container></section>}>
        <MatchesStrip matches={home?.sport?.nextMatches || []} />
        <MoviesStrip movies={home?.movies?.upcoming || []} />
      </LazySection>

      <LazySection placeholder={<section className="py-6"><Container><GridSkeleton /></Container></section>}>
        <SectionList title="Sărbători" items={home?.sections?.sarbatori || []} href="/categorii/sarbatori" />
        <SectionList title="Examene" items={home?.sections?.examene || []} href="/categorii/examene" />
        <SectionList title="Festivaluri" items={home?.sections?.festivaluri || []} href="/categorii/festivaluri" />
      </LazySection>

      <WeekAhead trending={home?.trending || []} />

      <NewsletterCta />

      <HomeAdRail />
    </>
  );
}
