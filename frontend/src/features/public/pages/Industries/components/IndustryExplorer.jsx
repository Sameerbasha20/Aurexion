import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import { industriesData } from "../../../../../data/industries";
import { useIndustries } from "../../../hooks/usePublicContent";
import { ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export const IndustryExplorer = () => {
  const { data: dbIndustries } = useIndustries();
  const [activeIndex, setActiveIndex] = useState(0);

  // Map database industries to Industry format
  const mappedDbIndustries = useMemo(() => {
    return (dbIndustries || []).map((dbInd) => {
      let challengesObj = { operational: [], regulatory: [], technical: [] };
      try {
        challengesObj = JSON.parse(dbInd.challenges);
      } catch (e) {
        challengesObj = {
          operational: [{ title: dbInd.challenges ? dbInd.challenges.slice(0, 50) + "..." : "Operational challenges", description: dbInd.challenges || "" }],
          regulatory: [],
          technical: []
        };
      }

      let solutionsArr = [];
      try {
        solutionsArr = JSON.parse(dbInd.target_solutions);
      } catch (e) {
        solutionsArr = dbInd.target_solutions ? [dbInd.target_solutions] : [];
      }

      return {
        id: `db-${dbInd.id}`,
        slug: dbInd.slug,
        name: dbInd.name || "",
        shortDescription: dbInd.challenges ? dbInd.challenges.slice(0, 150) + (dbInd.challenges.length > 150 ? "..." : "") : "Enterprise technology solutions.",
        icon: "Building",
        challenges: challengesObj,
        solutions: solutionsArr,
        relatedServices: [],
        technologies: ["Cloud Architecture", "Enterprise Security", "Distributed Systems"],
        relatedCaseStudies: [],
        outcomes: ["Security", "Scalability"]
      };
    });
  }, [dbIndustries]);

  // Combine static and DB industries, prioritizing DB industries for duplicates
  const allIndustries = useMemo(() => {
    const combined = [...mappedDbIndustries];
    industriesData.forEach((staticS) => {
      if (!combined.some((s) => s.slug === staticS.slug)) {
        combined.push(staticS);
      }
    });
    return combined;
  }, [mappedDbIndustries]);

  const activeIndustry = allIndustries[activeIndex] || allIndustries[0] || {};

  const primaryChallenges = useMemo(() => {
    if (!activeIndustry || !activeIndustry.challenges) return [];
    const list = [];
    if (Array.isArray(activeIndustry.challenges.operational)) {
      list.push(...activeIndustry.challenges.operational);
    }
    if (Array.isArray(activeIndustry.challenges.regulatory)) {
      list.push(...activeIndustry.challenges.regulatory);
    }
    if (Array.isArray(activeIndustry.challenges.technical)) {
      list.push(...activeIndustry.challenges.technical);
    }
    return list.slice(0, 3);
  }, [activeIndustry]);

  const solutionsList = useMemo(() => {
    if (!activeIndustry || !activeIndustry.solutions) return [];
    return activeIndustry.solutions.slice(0, 4);
  }, [activeIndustry]);

  return (
    <section id="industries-explorer" className="py-16 bg-[#070e17] border-t border-border/10 hidden md:block scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left: Navigation List */}
          <div className="lg:w-1/3 w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-mono tracking-[0.2em] text-primary">INDUSTRIES</h3>
              <span className="text-xs font-mono text-gray-500">{allIndustries.length} VERTICALS</span>
            </div>
            <div className="h-[480px] overflow-y-auto pr-3 scrollbar-thin scrollbar-thumb-border/40 scrollbar-track-transparent">
              <div className="flex flex-col gap-1.5">
                {allIndustries.map((ind, idx) => {
                  const isActive = idx === activeIndex;
                  const formattedNum = String(idx + 1).padStart(2, "0");
                  return (
                    <button
                      type="button"
                      key={ind.slug || ind.id || idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`text-left px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-colors ${
                        isActive 
                          ? "bg-primary/15 text-[#63f5e8] font-semibold border-l-2 border-primary shadow-sm" 
                          : "text-gray-400 hover:text-white hover:bg-card/30 border-l-2 border-transparent"
                      }`}
                    >
                      <span className="flex items-center gap-3 truncate">
                        <span className="font-mono text-xs opacity-60 flex-shrink-0">{formattedNum}</span>
                        <span className="truncate text-sm">{ind.name}</span>
                      </span>
                      {isActive && <ArrowRight className="w-3.5 h-3.5 text-primary flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Selected Industry Content */}
          <div className="lg:w-2/3 w-full">
            <div className="h-[480px] bg-[#0c1524] border border-border/25 rounded-xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
              
              <div className="relative z-10">
                {/* Header */}
                <div className="mb-2">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
                    {activeIndustry.name}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-300 mb-6 leading-relaxed max-w-3xl">
                  {activeIndustry.shortDescription}
                </p>

                {/* Challenges & Solutions Grid */}
                <div className="grid sm:grid-cols-2 gap-6 mb-6">
                  <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="text-xs font-mono text-gray-300 font-semibold tracking-wider">PRIMARY CHALLENGES</h4>
                    </div>
                    <ul className="space-y-2.5">
                      {primaryChallenges.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-xs text-gray-300 leading-snug">{c.title || c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-black/20 border border-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-xs font-mono text-gray-300 font-semibold tracking-wider">AUREXION SOLUTIONS</h4>
                    </div>
                    <ul className="space-y-2.5">
                      {solutionsList.map((s, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                          <span className="text-xs text-gray-300 leading-snug">{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Technology & Capabilities Highlights */}
                {activeIndustry.technologies && activeIndustry.technologies.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-[11px] font-mono text-gray-400 uppercase mr-1">TECH FOCUS:</span>
                    {activeIndustry.technologies.slice(0, 5).map((tech, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono px-2 py-0.5 bg-white/5 border border-white/10 text-gray-300 rounded"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Footer Action */}
              <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between">
                <Link 
                  href={`/industries/${activeIndustry.slug}`}
                  className="inline-flex items-center text-sm text-[#63f5e8] font-semibold hover:text-white transition-colors group"
                >
                  View Industry Details
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
                </Link>

                <Link
                  href="/contact"
                  className="text-xs font-mono text-gray-400 hover:text-primary transition-colors"
                >
                  Consult Sector Practice Lead &rarr;
                </Link>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default IndustryExplorer;
