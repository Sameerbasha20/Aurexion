import React from "react";
import { aboutData } from "../../../../../data/about";
import { Linkedin } from "lucide-react";

export const LeadershipSection: React.FC = () => {
  return (
    <section className="py-24 bg-[#050B14] border-t border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-[1px] bg-[#63f5e8]" />
            <span className="font-mono text-xs font-semibold tracking-[0.16em] uppercase text-[#63f5e8]">
              EXECUTIVE LEADERSHIP
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
            {aboutData.leadership.title}
          </h2>
          <p className="text-base md:text-lg text-gray-400 leading-relaxed">
            Seasoned technology executives and enterprise architects guiding our global engineering strategy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {aboutData.leadership.items.map((leader: any, index: number) => (
            <div
              key={index}
              className="group border border-[#1b2b3d] bg-[#0b1420] rounded-xl overflow-hidden hover:border-[#63f5e8]/40 hover:bg-[#0e1a2b] transition-all duration-200 flex flex-col"
            >
              {/* Executive Portrait */}
              <div className="aspect-[4/3] relative overflow-hidden bg-[#070e17] border-b border-[#1b2b3d]">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-full h-full object-cover object-top filter grayscale contrast-125 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b1420] via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              {/* Leader Details */}
              <div className="p-7 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-[#63f5e8] transition-colors">
                        {leader.name}
                      </h3>
                      <p className="text-xs font-mono font-semibold text-[#63f5e8] mt-1">
                        {leader.designation}
                      </p>
                    </div>
                    <a
                      href={leader.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${leader.name} LinkedIn Profile`}
                      className="p-2 rounded-md bg-[#132337] text-gray-400 hover:text-[#63f5e8] hover:bg-[#18304c] transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mt-4">
                    {leader.bio}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LeadershipSection;
