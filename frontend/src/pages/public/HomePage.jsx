import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, animate, motion, useInView } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Heart,
  Images,
  ListChecks,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { assets } from '../../assets/assets';
import { publicAPI } from '../../utils/api';

const HERO_SLIDES = [
  {
    src: assets.hero1,
    badge: 'Global disaster response',
    title: 'Relief that moves at the speed of trust.',
    description:
      'Blockchain-linked donations meet verified NGO milestones—from flood zones to wildfire lines—with transparency you can audit.',
  },
  {
    src: assets.hero2,
    badge: 'Transparent dashboards',
    title: 'Every dollar. Every milestone. Verified.',
    description:
      'Track funds released, shelter supplies, and proof-of-impact media in one place—no black boxes, no guesswork.',
  },
  {
    src: assets.hero3,
    badge: 'Wallet to last mile',
    title: 'Connect your wallet. Fund real recovery.',
    description:
      'MetaMask-ready flows, milestone-locked escrow, and humanitarian aid built for donors who demand proof—not promises.',
  },
];

/** Auto-advance slideshow interval */
const HERO_SLIDE_INTERVAL_MS = 7000;

const MISSION_PILLARS = [
  {
    title: 'Verified milestones',
    hint: 'Proof before funds move',
    Icon: ListChecks,
  },
  {
    title: 'Traceable flow',
    hint: 'Wallet to last mile',
    Icon: Wallet,
  },
  {
    title: 'Visible impact',
    hint: 'Dashboards & proof media',
    Icon: Images,
  },
];

const missionStaggerParent = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
};

const missionStaggerChild = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
  },
};

const HOW_IT_WORKS = {
  donor: {
    blurb:
      'Find vetted campaigns, give securely, and watch funds unlock only when milestones are met.',
    steps: [
      {
        icon: 'search_insights',
        title: '1. Choose & verify',
        description:
          'Support live campaigns. Donor proposals are confirmed by a partner NGO; NGO-created campaigns are reviewed by admins before publishing.',
      },
      {
        icon: 'payments',
        title: '2. Donate',
        description:
          'Pay with familiar methods or your wallet. Contributions stay in milestone-based escrow until proof is posted.',
      },
      {
        icon: 'monitoring',
        title: '3. Track impact',
        description:
          'Follow releases, supplies, and proof-of-impact updates as NGOs hit transparent recovery checkpoints.',
      },
    ],
  },
  ngo: {
    blurb:
      'Join as a verified partner, structure relief into milestones, and access funds as you prove delivery.',
    steps: [
      {
        icon: 'badge',
        title: '1. Apply & verify',
        description:
          'Submit your organization for review. Once approved, you can publish campaigns tied to real relief work.',
      },
      {
        icon: 'flag',
        title: '2. Plan milestones',
        description:
          'Define funding targets and recovery checkpoints. Donations lock in escrow and align with what donors see in the dashboard.',
      },
      {
        icon: 'photo_library',
        title: '3. Prove & receive',
        description:
          'Document delivery with updates and media. Verified milestones trigger releases—fast for you, transparent for donors.',
      },
    ],
  },
};

function ImpactStatValue({ inView, target, format, className }) {
  const [text, setText] = useState(() => (target == null ? '—' : format(0)));
  const animationRef = useRef(null);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop?.();
      animationRef.current = null;
    }

    if (target == null) {
      setText('—');
      return;
    }

    if (!inView) {
      setText(format(0));
      return;
    }

    animationRef.current = animate(0, target, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setText(format(v)),
    });

    return () => animationRef.current?.stop?.();
  }, [inView, target, format]);

  return (
    <p className={className} aria-live="polite">
      {text}
    </p>
  );
}

const HomePage = () => {
  const navigate = useNavigate();
  const [heroSlideIdx, setHeroSlideIdx] = useState(0);
  const [howAudience, setHowAudience] = useState('donor');
  const [impact, setImpact] = useState(null);
  const [homeCampaigns, setHomeCampaigns] = useState([]);
  const impactStatsRef = useRef(null);
  const impactStatsInView = useInView(impactStatsRef, { once: false, amount: 0.4 });

  useEffect(() => {
    publicAPI
      .impactStats()
      .then((res) => setImpact(res.data || res))
      .catch(() => setImpact(null));
    publicAPI
      .getCampaigns({ page: 1, limit: 3 })
      .then((res) => {
        const list = res.data?.campaigns || res.campaigns || [];
        setHomeCampaigns(Array.isArray(list) ? list : []);
      })
      .catch(() => setHomeCampaigns([]));
  }, []);

  const goNext = useCallback(() => {
    setHeroSlideIdx((i) => (i + 1) % HERO_SLIDES.length);
  }, []);

  const goPrev = useCallback(() => {
    setHeroSlideIdx((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  useEffect(() => {
    const id = setInterval(goNext, HERO_SLIDE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [goNext]);

  const slide = HERO_SLIDES[heroSlideIdx];

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface antialiased">
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Hero — split: left copy on light surface, right slideshow card (clearly different from full-bleed) */}
        <section className="border-b border-outline-variant/20 bg-surface">
          <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
            {/* Left: messaging */}
            <div className="order-2 text-left lg:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide.badge}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span className="mb-4 inline-block rounded-md bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                    {slide.badge}
                  </span>
                  <h1 className="mb-5 text-4xl font-extrabold leading-[1.08] tracking-tighter text-on-surface md:text-5xl lg:text-[2.75rem]">
                    {slide.title}
                  </h1>
                  <p className="mb-8 max-w-xl text-lg leading-relaxed text-on-surface-variant md:text-xl">
                    {slide.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/campaigns')}
                  className="primary-gradient rounded-lg px-7 py-3.5 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5 md:px-8 md:py-4 md:text-lg"
                >
                  Donate Now
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="rounded-lg border border-outline-variant bg-surface-container-highest px-7 py-3.5 text-base font-semibold text-on-surface transition hover:bg-surface-dim md:px-8 md:py-4 md:text-lg"
                >
                  Join as NGO
                </button>
              </div>

              <div className="mt-8 flex items-center gap-2">
                {HERO_SLIDES.map((s, i) => (
                  <button
                    key={s.badge}
                    type="button"
                    aria-label={`Slide ${i + 1}`}
                    aria-current={i === heroSlideIdx ? 'true' : undefined}
                    onClick={() => setHeroSlideIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === heroSlideIdx ? 'w-10 bg-primary' : 'w-2 bg-outline-variant hover:bg-outline'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: slideshow only inside this frame */}
            <div className="order-1 lg:order-2">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#020a14] shadow-xl ring-1 ring-outline-variant/40 lg:aspect-[5/4] lg:min-h-[380px]">
                <AnimatePresence initial={false} mode="sync">
                  <motion.div
                    key={heroSlideIdx}
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <img
                      src={slide.src}
                      alt=""
                      className="h-full w-full object-cover object-center"
                      loading={heroSlideIdx === 0 ? 'eager' : 'lazy'}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                  </motion.div>
                </AnimatePresence>

                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white backdrop-blur-sm transition hover:bg-black/55"
                  aria-label="Next slide"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Impact Stats — compact card; count-up resets and replays each time section enters view */}
        <section className="relative z-10 mt-6 px-6 pb-1">
          <div
            ref={impactStatsRef}
            className="mx-auto max-w-7xl rounded-xl border border-outline-variant/15 bg-surface-container-lowest py-5 shadow-ambient md:py-6"
          >
            <div className="grid grid-cols-1 gap-6 px-4 text-center md:grid-cols-3 md:gap-8 md:px-6 lg:px-8">
              <div className="flex flex-col items-center">
                <div
                  className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20"
                  aria-hidden
                >
                  <DollarSign className="h-5 w-5" strokeWidth={2} />
                </div>
                <ImpactStatValue
                  inView={impactStatsInView}
                  target={impact ? Number(impact.totalRaised) || 0 : null}
                  format={(n) => `$${Math.round(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
                  className="mb-0.5 text-4xl font-black tabular-nums tracking-tighter md:text-[2.5rem] text-primary"
                />
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline sm:text-xs">Total raised (platform)</p>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/12 text-secondary ring-1 ring-secondary/25"
                  aria-hidden
                >
                  <Heart className="h-5 w-5" strokeWidth={2} />
                </div>
                <ImpactStatValue
                  inView={impactStatsInView}
                  target={impact ? Number(impact.donationCount) || 0 : null}
                  format={(n) => Math.round(n).toLocaleString()}
                  className="mb-0.5 text-4xl font-black tabular-nums tracking-tighter md:text-[2.5rem] text-secondary"
                />
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline sm:text-xs">Donations recorded</p>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-on-surface/8 text-on-surface ring-1 ring-outline-variant/40"
                  aria-hidden
                >
                  <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                </div>
                <ImpactStatValue
                  inView={impactStatsInView}
                  target={impact ? Number(impact.verifiedNgos) || 0 : null}
                  format={(n) => `${Math.round(n)}`}
                  className="mb-0.5 text-4xl font-black tabular-nums tracking-tighter md:text-[2.5rem] text-on-surface"
                />
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline sm:text-xs">Verified NGOs</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission — short copy, pillars, light motion; not a wall of text */}
        <motion.section
          className="border-t border-outline-variant/15 bg-surface-container-low/35 px-6 pt-16 pb-8 md:pt-20 md:pb-10"
          variants={missionStaggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
        >
          <div className="mx-auto max-w-4xl">
            <motion.div variants={missionStaggerChild} className="text-center">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.28em] text-primary sm:text-xs">
                Our mission
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-snug text-on-surface-variant md:text-base">
                Transparency-first relief for donors, NGOs, and the communities they serve.
              </p>
            </motion.div>

            <motion.h3
              variants={missionStaggerChild}
              className="mx-auto mt-8 max-w-3xl text-center text-3xl font-bold leading-[1.15] tracking-tight text-on-surface md:text-4xl md:leading-[1.12]"
            >
              We bridge global empathy and local action.
            </motion.h3>
            <motion.p
              variants={missionStaggerChild}
              className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-relaxed text-on-surface-variant md:text-base"
            >
              Every contribution moves through verified milestones—you see progress, not promises.
            </motion.p>

            <motion.div
              variants={missionStaggerChild}
              className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4"
            >
              {MISSION_PILLARS.map(({ title, hint, Icon }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-lowest/90 px-4 py-3.5 text-left shadow-sm backdrop-blur-sm"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15"
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <div className="min-w-0 pt-0.5">
                    <p className="text-sm font-bold leading-tight text-on-surface">{title}</p>
                    <p className="mt-0.5 text-xs leading-snug text-on-surface-variant">{hint}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div
              variants={missionStaggerChild}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-8"
            >
              <div className="h-1 w-20 shrink-0 rounded-full bg-primary md:w-24" aria-hidden />
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:gap-2.5 hover:underline"
              >
                How we&apos;re different
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* How it Works — tabs switch donor vs NGO steps */}
        <section className="border-t border-outline-variant/10 bg-surface-container-low px-6 pt-10 pb-16 md:pt-12 md:pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-6 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-xl">
                <h2 className="mb-3 text-4xl font-black tracking-tighter text-on-surface">How DeReFund works</h2>
                <motion.p
                  key={howAudience}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.22 }}
                  className="text-on-surface-variant"
                >
                  {HOW_IT_WORKS[howAudience].blurb}
                </motion.p>
              </div>
              <div
                className="flex flex-wrap gap-2"
                role="tablist"
                aria-label="Choose donor or NGO steps"
              >
                <button
                  type="button"
                  role="tab"
                  id="how-tab-donor"
                  aria-selected={howAudience === 'donor'}
                  aria-controls="how-it-works-panel"
                  onClick={() => setHowAudience('donor')}
                  className={`rounded-full border border-black px-4 py-2 text-xs font-bold uppercase tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    howAudience === 'donor'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-dim'
                  }`}
                >
                  For donors
                </button>
                <button
                  type="button"
                  role="tab"
                  id="how-tab-ngo"
                  aria-selected={howAudience === 'ngo'}
                  aria-controls="how-it-works-panel"
                  onClick={() => setHowAudience('ngo')}
                  className={`rounded-full border border-black px-4 py-2 text-xs font-bold uppercase tracking-wide transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    howAudience === 'ngo'
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-dim'
                  }`}
                >
                  For NGOs
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={howAudience}
                id="how-it-works-panel"
                role="tabpanel"
                aria-labelledby={howAudience === 'donor' ? 'how-tab-donor' : 'how-tab-ngo'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="grid grid-cols-1 gap-6 md:grid-cols-3"
              >
                {HOW_IT_WORKS[howAudience].steps.map((step) => (
                  <div
                    key={`${howAudience}-${step.title}`}
                    className="group rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 shadow-sm transition-all hover:shadow-ambient md:p-8"
                  >
                    <div className="mb-5 text-primary transition-transform group-hover:scale-110 md:mb-6">
                      <span className="material-symbols-outlined text-5xl">{step.icon}</span>
                    </div>
                    <h3 className="mb-3 text-xl font-bold text-on-surface">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">{step.description}</p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Urgent Relief Efforts */}
        <section className="py-24 px-6 bg-surface">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
              <h2 className="text-4xl font-black tracking-tighter">Urgent Relief Efforts</h2>
              <Link
                to="/campaigns"
                className="flex items-center gap-2 font-semibold text-primary transition hover:underline"
              >
                View All Campaigns <span className="material-symbols-outlined">arrow_right_alt</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {homeCampaigns.length === 0 ? (
                <p className="col-span-full text-center text-on-surface-variant py-8">
                  No live campaigns yet. Check back after administrators publish approved relief efforts.
                </p>
              ) : (
                homeCampaigns.map((c) => {
                  const img =
                    (c.image_urls && c.image_urls[0]) ||
                    (c.disaster_images && c.disaster_images[0]);
                  const raised = Number(c.current_amount) || 0;
                  const target = Number(c.target_amount) || 1;
                  const pct = Math.min(100, Math.round((raised / target) * 100));
                  return (
                    <div
                      key={c.campaign_id}
                      className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-ambient transition-all flex flex-col border border-outline-variant/15"
                    >
                      <div className="relative h-56 overflow-hidden bg-surface-container-high">
                        {img ? (
                          <img className="w-full h-full object-cover" alt="" src={img} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-on-surface-variant opacity-20">
                            <span className="material-symbols-outlined text-6xl">image</span>
                          </div>
                        )}
                        <div className="absolute top-4 left-4 bg-primary text-on-primary text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wider">
                          Live
                        </div>
                      </div>
                      <div className="p-6 flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-4 gap-2">
                          <h3 className="font-bold text-lg leading-tight line-clamp-2">{c.title}</h3>
                          <span className="material-symbols-outlined text-secondary shrink-0">verified</span>
                        </div>
                        <p className="text-xs text-outline mb-3 line-clamp-1">{c.ngo_name}</p>
                        <div className="w-full bg-surface-container-high h-2 rounded-full mb-3 mt-auto">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-bold text-outline mb-6">
                          <span>
                            {raised.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}{' '}
                            raised
                          </span>
                          <span className="text-on-surface">{pct}%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/campaigns/${c.campaign_id}`)}
                          className="w-full rounded-lg border border-outline-variant bg-surface-container-high py-3 text-sm font-semibold text-on-surface transition hover:border-primary hover:bg-primary hover:text-on-primary"
                        >
                          View campaign
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        {/* Transparency & Trust */}
        <section className="py-24 bg-on-surface text-surface px-6 overflow-hidden relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-8 leading-tight">
                Trust isn&apos;t promised.
                <br />
                It&apos;s programmed.
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined">gavel</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Volunteer Verification</h4>
                    <p className="text-sm leading-relaxed text-white/75">
                      Our &quot;Ground Truth&quot; network of independent volunteers verifies every milestone before
                      funds are released from escrow.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined">account_balance_wallet</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Milestone Tracking</h4>
                    <p className="text-sm leading-relaxed text-white/75">
                      Funds are disbursed in phases. Each phase requires photographic and geo-tagged proof of completion
                      to unlock the next tranche.
                    </p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary-container/20 flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined">lock_open</span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold mb-2">Immutable Transparency</h4>
                    <p className="text-sm leading-relaxed text-white/75">
                      Every transaction and verification step is logged on a public ledger, providing an audit trail that
                      cannot be altered or obscured.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-surface-container-highest/10 rounded-2xl p-4 backdrop-blur-md border border-white/10 rotate-3">
                <img
                  className="rounded-lg shadow-2xl"
                  alt="Dashboard UI showing impact charts and fund flows"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPW_UqbXqWXfSmNh2tDo9PkG23hV5tgB9TJywymtXADc58c9QMumMLf9ViqCcLaywrZ68iwdEeQdI3t36ZgMWLqqeetgUgesTMWVlzy-kPWgrM92RM1F04gCm9qsq3JQQqGMCQxDM8CPtFw48nxkjE4WIw_pd8ngmBf84exOL_SJD32Myhj9GsnV1rgc4LSCYLQZQH1G3ICYU4u4XmkTFexg26O-gAl4lKFiYPS1IF2TcodcFplGyWMbmUJfMGV7zOToIU-oPwWjs"
                />
              </div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-24 px-6 bg-surface-container-low">
          <div className="max-w-5xl mx-auto bg-surface-container-lowest p-12 rounded-2xl shadow-ambient border border-outline-variant/5">
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-6xl text-primary/30 mb-8">format_quote</span>
              <p className="text-2xl md:text-3xl font-medium text-on-surface leading-snug mb-10">
                &quot;DeReFund has completely transformed how we respond to local crises. The speed at which we can now
                access verified donor funds means we can deploy aid in hours, not weeks.&quot;
              </p>
              <div className="flex items-center gap-4 text-left">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-200">
                  <img
                    className="w-full h-full object-cover"
                    alt="Portrait of humanitarian worker"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBpjLU-UL_jlonuGXyKKhunYTeUBSP_NEOjMC0xR_DD6ASuIc2VvqlYzE4tGlrY_H8K0kXoUfMpAsst8jfvCwTAsj-wMYR6LNxIqyxb6nACUJ1Cg5n_BNyZd-_tP2L352FPXiWP3oYKWMKh41zrS8ApFZc60fbjKOTnR5OLSumNcWue20j5GVZ7J0SscEw9lNNBITMerptkC8BkjMukuHY2uYLmivhfLHdxYYc3GKBaNbpHmBsiOmM5mwvSiSbQGsHFKZwUqdDIjV8"
                  />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Elena Rodriguez</p>
                  <p className="text-sm text-on-surface-variant">Director, Hope First NGO</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-black tracking-tighter mb-6">
              Ready to make a difference?
            </h2>
            <p className="text-on-surface-variant text-lg mb-10">
              Join thousands of donors and verified NGOs working together to rebuild what matters.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                type="button"
                onClick={() => navigate('/campaigns')}
                className="primary-gradient rounded-lg px-10 py-5 text-xl font-semibold text-white shadow-lg transition active:scale-[0.98]"
              >
                View Live Campaigns
              </button>
              <button
                type="button"
                onClick={() => navigate('/about')}
                className="rounded-lg border border-outline-variant bg-surface-container-highest px-10 py-5 text-xl font-semibold text-on-surface transition hover:bg-surface-dim active:scale-[0.98]"
              >
                Partner With Us
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;

