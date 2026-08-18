/* Midnight Signal: cinematic digital brutalism, oversized editorial type, signal-cyan routes, and interactions that reveal structure. */
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUpRight, ChevronRight, Circle, Landmark, LineChart, ShieldCheck, Activity, GraduationCap, Factory, ShoppingBag, ShoppingCart, Truck, Building, HardHat, Utensils, Plane, Car, Signal, Briefcase, Rocket, Cpu, BrainCircuit, Cloud, Layers, Globe, type LucideIcon } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { useCaseStudies, useBlogPosts } from "../../public/hooks/usePublicContent";
import { Link } from "wouter";
import { HeroVideoBackground } from "../../../components/common/HeroVideoBackground";
import { serviceCategories, servicesData } from "../../../data/services";
import { industriesData } from "../../../data/industries";

const principles = [
  ["01", "ENGINEERING FIRST", "Start with the system, not the surface. Make the foundation capable of carrying what comes next."],
  ["02", "INTELLIGENCE BY DESIGN", "Embed intelligence where decisions are made, so complexity becomes a competitive advantage."],
  ["03", "SECURITY AT SCALE", "Build trust into every layer, from the first architecture sketch to the last deployment."],
  ["04", "BUILT FOR TOMORROW", "Choose patterns and platforms that leave room for the future to arrive."],
];

const INDUSTRY_ICONS: Record<string, LucideIcon> = {
  Landmark, LineChart, ShieldCheck, Activity, GraduationCap,
  Factory, ShoppingBag, ShoppingCart, Truck, Building,
  HardHat, Utensils, Plane, Car, Signal, Briefcase, Rocket,
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "01": Cpu,
  "02": BrainCircuit,
  "03": Cloud,
  "04": Layers,
  "05": Globe,
  "06": ShieldCheck,
};

const STATS = [
  { number: "32", label: "TECHNOLOGY DOMAINS", desc: "Across 6 core service categories" },
  { number: "18", label: "INDUSTRY SECTORS", desc: "Enterprise vertical markets served" },
  { number: "6", label: "CORE CAPABILITIES", desc: "End-to-end engineering disciplines" },
  { number: "100%", label: "ENTERPRISE FOCUS", desc: "Mission-critical delivery standards" },
];

// Estimator config
const ESTIMATOR_STEPS = [
  {
    label: "STEP 01 / PROJECT SCOPE",
    question: "What are you building?",
    options: ["Web Application", "Mobile App", "Enterprise Software / ERP", "CRM Platform", "AI / ML Platform", "Cloud Migration", "SaaS Product", "Digital Transformation"],
  },
  {
    label: "STEP 02 / PLATFORM & SCALE",
    question: "How will it be deployed?",
    options: ["Multi-tenant SaaS", "Internal Enterprise Tool", "Consumer-Facing Platform", "Cross-Platform Mobile", "Hybrid Cloud", "On-Premise Enterprise"],
  },
  {
    label: "STEP 03 / USER SCALE",
    question: "Expected user volume & integrations?",
    options: ["< 1,000 Users", "10,000+ Users", "100,000+ Users", "No 3rd-Party Integrations", "Simple Integrations", "Complex API Integrations"],
  },
  {
    label: "STEP 04 / SECURITY & COMPLIANCE",
    question: "What compliance requirements apply?",
    options: ["Standard Security", "SOC 2 Compliance", "HIPAA Compliance", "GDPR Compliance", "Government / Public Sector", "Multi-Framework Compliance"],
  },
];

// Budget estimation logic
const getBudgetRange = (selections: number[]): string => {
  const weights = [selections[0] ?? 0, selections[1] ?? 0, selections[2] ?? 0, selections[3] ?? 0];
  const score = weights.reduce((a, b) => a + b, 0);
  if (score <= 4) return "$15,000 – $45,000";
  if (score <= 9) return "$45,000 – $120,000";
  if (score <= 14) return "$120,000 – $350,000";
  return "$350,000+";
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ─── Estimator Component ──────────────────────────────────────────────── */
function ProjectEstimator() {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<(number | null)[]>([null, null, null, null]);
  const [done, setDone] = useState(false);

  const select = (optIdx: number) => {
    const updated = [...selections];
    updated[step] = optIdx;
    setSelections(updated);
  };

  const canAdvance = selections[step] !== null;

  const advance = () => {
    if (step < ESTIMATOR_STEPS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const reset = () => { setStep(0); setSelections([null, null, null, null]); setDone(false); };

  return (
    <div className="estimator-body">
      {!done ? (
        <>
          {ESTIMATOR_STEPS.map((s, i) => (
            <div key={i} className={`estimator-step ${i === step ? "active" : ""}`}>
              <p className="estimator-step-label">{s.label}</p>
              <h3>{s.question}</h3>
              <div className="estimator-options">
                {s.options.map((opt, j) => (
                  <button
                    key={j}
                    className={`estimator-opt ${selections[i] === j ? "selected" : ""}`}
                    onClick={() => select(j)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="estimator-nav">
            <div className="estimator-progress">
              {ESTIMATOR_STEPS.map((_, i) => (
                <span key={i} className={`estimator-dot ${i <= step ? "active" : ""}`} />
              ))}
            </div>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              {step > 0 && (
                <button className="estimator-back" onClick={() => setStep(step - 1)}>← BACK</button>
              )}
              <button
                className="signal-button"
                style={{ opacity: canAdvance ? 1 : 0.4, cursor: canAdvance ? "pointer" : "default" }}
                onClick={() => canAdvance && advance()}
              >
                {step === ESTIMATOR_STEPS.length - 1 ? "GET ESTIMATE" : "NEXT →"}
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="estimator-result">
          <p className="estimator-result-label">PRELIMINARY ESTIMATE</p>
          <h3>Based on your requirements</h3>
          <div className="estimator-result-range">{getBudgetRange(selections as number[])}</div>
          <p style={{ color: "#8da5ae", fontSize: ".88rem" }}>Indicative engineering effort budget range</p>
          <div className="estimator-disclaimer">
            <strong style={{ color: "#eef4f3" }}>Disclaimer: </strong>
            This estimate represents a preliminary requirement assessment only and does not constitute a binding legal proposal, contract, or commitment. Final pricing is subject to detailed discovery, scope definition, and formal proposal issuance by Aurexion Technologies.
          </div>
          <div className="estimator-result-ctas">
            <Link href="/rfp" className="signal-button inline-flex items-center gap-2">
              SUBMIT FORMAL RFP <ArrowUpRight size={16} />
            </Link>
            <button className="text-button" onClick={reset}>START OVER</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Home Page ─────────────────────────────────────────────────────────── */
export default function Home() {
  const [activeIndustry, setActiveIndustry] = useState<number | null>(null);
  const [showAllIndustries, setShowAllIndustries] = useState(false);
  const [dialog, setDialog] = useState<"contact" | "project" | null>(null);

  const { data: caseStudies } = useCaseStudies();
  const { data: blogPosts } = useBlogPosts();

  useEffect(() => {
    if (window.location.hash) {
      const hash = window.location.hash.replace("#", "");
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, []);

  const openDialog = (type: "contact" | "project") => setDialog(type);
  const action = (label: string) => toast.success(label, { description: "Done." });

  return (
    <div className="aurexion">
      <main>

        {/* ── 01 HERO ──────────────────────────────────────────────────── */}
        <section id="top" className="hero section-dark">
          <HeroVideoBackground videoUrl="/videos/hero-bg.mp4" />
          <div className="hero-grid" />
          <div className="hero-copy reveal">
            <p className="eyebrow"><Circle size={8} fill="currentColor" /> 01 / DIGITAL INTELLIGENCE</p>
            <h1>ENGINEERING<br /><em>WHAT COMES NEXT.</em></h1>
            <p className="hero-sub">AI. Software. Cloud. Data.<br />Engineered for the enterprise.</p>
            <div className="hero-ctas">
              <Link href="/rfp" className="signal-button inline-flex items-center">SUBMIT RFP <ArrowUpRight size={17} className="ml-1" /></Link>
              <button className="text-button" onClick={() => scrollToId("estimator")}>ESTIMATE PROJECT <ArrowDown size={16} /></button>
            </div>
          </div>
          <div className="scroll-cue"><span>SCROLL TO EXPLORE</span><ArrowDown size={15} /></div>
        </section>

        {/* ── 02 STATS ─────────────────────────────────────────────────── */}
        <section className="stats-section section-dark">
          <div className="section-index">02 / IMPACT METRICS</div>
          <div className="stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="stat-item">
                <span className="stat-number">{s.number}</span>
                <span className="stat-label">{s.label}</span>
                <p className="stat-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 03 STATEMENT ─────────────────────────────────────────────── */}
        <section id="about" className="statement section-dark section-padding">
          <div className="section-index">03 / THE SHIFT</div>
          <div className="statement-copy">
            <p>Complex problems.</p>
            <h2>Intelligent systems.</h2>
            <div className="signal-rule" />
            <p className="statement-note">The hard part is rarely the technology alone. It is the architecture, the decisions, and the intelligence that make every layer work together.</p>
          </div>
          <div className="orbital-orb"><span /><span /><span /></div>
        </section>

        {/* ── 04 SERVICES — 6 GROUPED CATEGORIES ──────────────────────── */}
        <section id="services" className="services-grouped section-dark">
          <div className="section-index">04 / WHAT WE ENGINEER</div>
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">SERVICES & CAPABILITIES</p>
              <h2>Technology with<br /><em>a point of view.</em></h2>
            </div>
            <p className="heading-note">32 engineering capabilities across 6 disciplines — each one a lens on what your system should make possible.</p>
          </div>

          <div className="services-cat-grid">
            {serviceCategories.map((cat) => {
              const catServices = servicesData.filter((s) => s.category === cat.name);
              const preview = catServices.slice(0, 3);
              const remaining = catServices.length - 3;
              const Icon = CATEGORY_ICONS[cat.id] ?? Cpu;
              return (
                <div key={cat.id} className="service-card-pro">
                  <div className="svc-pro-header">
                    <span className="svc-pro-num">{cat.id}</span>
                    <Icon size={18} className="svc-pro-icon" />
                  </div>

                  <Link href={`/services?category=${encodeURIComponent(cat.name)}#explorer`} className="svc-pro-title hover:text-[#63f5e8] transition-colors block">
                    {cat.name}
                  </Link>
                  <p className="svc-pro-desc">{cat.description}</p>

                  <ul className="svc-pro-list">
                    {preview.map((s) => (
                      <li key={s.id}>
                        <Link href={`/services/${s.slug}`} className="hover:text-[#63f5e8] transition-colors inline-flex items-center gap-2">
                          <span className="svc-pro-bullet" />
                          {s.name}
                        </Link>
                      </li>
                    ))}
                    {remaining > 0 && (
                      <li className="svc-pro-more">
                        <Link href={`/services?category=${encodeURIComponent(cat.name)}#explorer`} className="hover:underline">
                          +{remaining} more capabilities
                        </Link>
                      </li>
                    )}
                  </ul>

                  <Link href={`/services?category=${encodeURIComponent(cat.name)}#explorer`} className="svc-pro-footer group">
                    <span>EXPLORE CATEGORY</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem" }}>
            <Link href="/services" className="signal-button inline-flex items-center gap-2">
              VIEW ALL 32 SERVICES <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── 05 AI IMMERSIVE ──────────────────────────────────────────── */}
        <section id="ai" className="immersive-section ai-section section-dark" style={{ backgroundImage: "url(/manus-storage/aurexion-neural_ae3aae0d.png)" }}>
          <div className="section-index">05 / AI & INTELLIGENCE</div>
          <div className="immersive-overlay" />
          <div className="immersive-content">
            <p className="eyebrow">AI & INTELLIGENCE</p>
            <h2>INTELLIGENCE<br /><em>WITHOUT LIMITS.</em></h2>
            <p>From generative models to intelligent operations, we turn data into decisions that move with the business.</p>
            <Link href="/services/artificial-intelligence-solutions" className="text-button inline-flex items-center gap-2">
              EXPLORE AI SERVICES <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="floating-labels">
            {["GENERATIVE AI", "MACHINE LEARNING", "COMPUTER VISION", "NLP", "AI AGENTS", "PREDICTIVE ANALYTICS"].map((label) => <span key={label}>{label}</span>)}
          </div>
        </section>

        {/* ── 06 INDUSTRIES — ALL 18 ───────────────────────────────────── */}
        <section id="industries" className="section-dark section-padding">
          <div className="section-index">06 / INDUSTRIES</div>
          <div className="section-heading split-heading">
            <div>
              <p className="eyebrow">BUILT FOR COMPLEX INDUSTRIES</p>
              <h2>Where the stakes<br /><em>are highest.</em></h2>
            </div>
            <p className="heading-note">18 vertical markets. Each one a different set of constraints, regulations, and ambitions — all demanding the same standard of engineering.</p>
          </div>

          <div className="industries-18-grid">
            {(showAllIndustries ? industriesData : industriesData.slice(0, 6)).map((ind: any, i: number) => {
              const Icon = INDUSTRY_ICONS[ind.icon] ?? Briefcase;
              return (
                <Link
                  key={ind.id}
                  href={`/industries/${ind.slug}`}
                  className={`industry-card-modern ${activeIndustry === i ? "active" : ""}`}
                  onMouseEnter={() => setActiveIndustry(i)}
                  onMouseLeave={() => setActiveIndustry(null)}
                >
                  <div className="ind-card-header">
                    <div className="ind-card-icon-box">
                      <Icon size={20} className="ind-card-icon" />
                    </div>
                    <span className="ind-card-num">{ind.id}</span>
                  </div>

                  <h3 className="ind-card-title">{ind.name}</h3>
                  <p className="ind-card-desc">{ind.shortDescription}</p>

                  <div className="ind-card-footer">
                    <div className="ind-card-tags">
                      {ind.solutions?.slice(0, 2).map((sol: string, idx: number) => (
                        <span key={idx} className="ind-card-tag">{sol}</span>
                      ))}
                    </div>
                    <span className="ind-card-arrow">
                      <ArrowUpRight size={14} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: "3rem", display: "flex", gap: "1.5rem", justifyContent: "center" }}>
            <button
              onClick={() => setShowAllIndustries(!showAllIndustries)}
              className="signal-button inline-flex items-center gap-2"
            >
              {showAllIndustries ? "SHOW FEATURED 6 SECTORS ↑" : "EXPLORE ALL 18 SECTORS (12 MORE) ↓"}
            </button>
            <Link href="/industries" className="text-button inline-flex items-center gap-2">
              VIEW ALL INDUSTRIES <ArrowUpRight size={16} />
            </Link>
          </div>
        </section>

        {/* ── 07 CASE STUDIES ──────────────────────────────────────────── */}
        <section id="work" className="work-section section-dark section-padding">
          <div className="section-index">07 / ENGINEERED IN THE REAL WORLD</div>
          <div className="work-header">
            <div>
              <p className="eyebrow">SELECTED WORK</p>
              <h2>Systems that<br /><em>change the field.</em></h2>
            </div>
            <Link href="/case-studies" className="text-button">VIEW ALL WORK <ArrowUpRight size={16} /></Link>
          </div>

          {caseStudies && caseStudies.length > 0 ? (
            <article className="case-study">
              <div className="case-visual" style={{ padding: 0, overflow: "hidden" }}>
                <img
                  src="/manus-storage/case-study-intelligence.jpg"
                  alt="Enterprise Intelligence Platform"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,8,17,0.3) 0%, rgba(5,8,17,0.7) 100%)", pointerEvents: "none" }} />
                <p className="case-number">01</p>
                <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", color: "#63f5e8", letterSpacing: ".12em", background: "rgba(5,8,17,.8)", padding: ".3rem .6rem", border: "1px solid rgba(99,245,232,.3)" }}>
                    4K ARCHITECTURE VISUAL
                  </span>
                </div>
              </div>
              <div className="case-copy">
                <p className="eyebrow">{caseStudies[0].industry}</p>
                <h3>{caseStudies[0].title}</h3>
                <p>{caseStudies[0].challenge}</p>
                <div className="case-facts">
                  <span><b>CHALLENGE</b> {caseStudies[0].challenge}</span>
                  <span><b>SOLUTION</b> {caseStudies[0].solution}</span>
                  <span><b>OUTCOME</b> {caseStudies[0].results}</span>
                </div>
                <Link href="/case-studies" className="text-button">EXPLORE CASE STUDY <ArrowUpRight size={16} /></Link>
              </div>
            </article>
          ) : (
            <article className="case-study">
              <div className="case-visual" style={{ padding: 0, overflow: "hidden" }}>
                <img
                  src="/manus-storage/case-study-intelligence.jpg"
                  alt="Enterprise Intelligence Platform"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,8,17,0.3) 0%, rgba(5,8,17,0.7) 100%)", pointerEvents: "none" }} />
                <p className="case-number">01</p>
                <div style={{ position: "absolute", bottom: "1.5rem", left: "1.5rem", right: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "'IBM Plex Mono'", fontSize: ".62rem", color: "#63f5e8", letterSpacing: ".12em", background: "rgba(5,8,17,.8)", padding: ".3rem .6rem", border: "1px solid rgba(99,245,232,.3)" }}>
                    4K ARCHITECTURE VISUAL
                  </span>
                </div>
              </div>
              <div className="case-copy">
                <p className="eyebrow">AI + DATA + CLOUD</p>
                <h3>Enterprise<br /><em>Intelligence Platform</em></h3>
                <p>Reframing a complex operating environment as one connected decision system.</p>
                <div className="case-facts">
                  <span><b>CHALLENGE</b> Fragmented intelligence across business silos</span>
                  <span><b>SOLUTION</b> Unified neural data platform & real-time analytics</span>
                  <span><b>OUTCOME</b> Sub-second decision cycles with 99.99% uptime</span>
                </div>
                <Link href="/case-studies" className="text-button">EXPLORE CASE STUDIES <ArrowUpRight size={16} /></Link>
              </div>
            </article>
          )}
        </section>

        {/* ── 08 WHY AUREXION ──────────────────────────────────────────── */}
        <section className="principles section-dark section-padding">
          <div className="section-index">08 / WHY AUREXION</div>
          <div className="principles-heading">
            <p className="eyebrow">THE DIFFERENCE</p>
            <h2>We don't just<br />implement technology.</h2>
            <h2 className="accent">We engineer<br />what it becomes.</h2>
          </div>
          <div className="principles-grid">
            {principles.map(([num, title, desc]) => (
              <Link href="/why-us" className="principle block" key={num}>
                <span className="principle-num">{num}</span>
                <h3>{title}</h3>
                <p>{desc}</p>
                <ArrowUpRight size={17} />
              </Link>
            ))}
          </div>
        </section>

        {/* ── 09 INTERACTIVE ESTIMATOR ─────────────────────────────────── */}
        <section id="estimator" className="estimator-section section-dark">
          <div className="section-index">09 / ESTIMATE YOUR PROJECT</div>
          <div className="estimator-wrap">
            <div className="section-heading" style={{ margin: 0 }}>
              <p className="eyebrow">INTERACTIVE REQUIREMENT ESTIMATOR</p>
              <h2>What will you<br /><em>engineer next?</em></h2>
              <p style={{ color: "#8da5ae", marginTop: "1.2rem", fontSize: ".98rem", lineHeight: 1.6, maxWidth: "460px" }}>
                Select your engineering requirements and target architecture to calculate an instant preliminary effort and budget range.
              </p>
              <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.8rem", color: "#63f5e8", fontFamily: "'IBM Plex Mono', monospace", fontSize: ".72rem", letterSpacing: ".08em" }}>
                <span>✓ 60-SECOND INTERACTIVE DISCOVERY</span>
                <span>✓ ZERO COMMITMENT REQUIRED</span>
                <span>✓ TIER-1 ENTERPRISE ARCHITECTURE SCOPING</span>
              </div>
            </div>
            <ProjectEstimator />
          </div>
        </section>

        {/* ── 10 INSIGHTS ──────────────────────────────────────────────── */}
        <section id="insights" className="insights section-dark section-padding">
          <div className="section-index">10 / INSIGHTS</div>
          <div className="work-header">
            <div>
              <p className="eyebrow">THOUGHTS ON WHAT'S NEXT</p>
              <h2>Signals worth<br /><em>following.</em></h2>
            </div>
            <Link href="/blog" className="text-button">VIEW ALL INSIGHTS <ArrowUpRight size={16} /></Link>
          </div>
          <div className="insight-grid">
            {[
              {
                tag: "AI",
                date: "06.18.26",
                title: "The new shape of enterprise intelligence",
                image: "/manus-storage/insight-ai.jpg",
              },
              {
                tag: "CLOUD",
                date: "05.29.26",
                title: "Why resilient systems begin with a point of view",
                image: "/manus-storage/insight-cloud.jpg",
              },
              {
                tag: "ENGINEERING",
                date: "04.11.26",
                title: "Complexity is a signal, not a sentence",
                image: "/manus-storage/insight-engineering.jpg",
              },
            ].map((post) => (
              <Link href="/blog" className="insight-card block" key={post.title}>
                <div className="insight-img-wrap">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="insight-photo"
                  />
                  <div className="insight-img-overlay" />
                </div>
                <span className="eyebrow">{post.tag} / {post.date}</span>
                <h3>{post.title}</h3>
                <span className="read-link">READ ARTICLE <ArrowUpRight size={15} /></span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── 11 FINAL CTA ─────────────────────────────────────────────── */}
        <section className="final-cta section-dark">
          <div className="final-art" />
          <div className="final-copy">
            <p className="eyebrow">THE NEXT SYSTEM STARTS HERE</p>
            <h2>WHAT WILL YOU<br /><em>ENGINEER NEXT?</em></h2>
            <p>Bring us your most complex technology challenge.</p>
            <div className="hero-ctas">
              <Link href="/rfp" className="signal-button inline-flex items-center">SUBMIT RFP <ArrowUpRight size={17} className="ml-1" /></Link>
              <Link href="/contact" className="text-button">TALK TO AN EXPERT <ArrowUpRight size={16} /></Link>
            </div>
          </div>
        </section>

      </main>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <DialogContent className="aurexion-dialog">
          <DialogHeader>
            <DialogTitle>{dialog === "project" ? "Start with the hard problem." : "Let's make the next system legible."}</DialogTitle>
            <DialogDescription>{dialog === "project" ? "Tell us what you are trying to engineer." : "Aurexion connects strategy, engineering and intelligence in one conversation."}</DialogDescription>
          </DialogHeader>
          <div className="dialog-form">
            <input placeholder="Your name" aria-label="Your name" />
            <input placeholder="Work email" aria-label="Work email" type="email" />
            <textarea placeholder="What are you trying to make possible?" aria-label="Project details" rows={4} />
            <Button className="signal-button" onClick={() => { setDialog(null); action("Message queued"); }}>SEND MESSAGE <ArrowUpRight size={16} /></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
