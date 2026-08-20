import React from "react";
import { LucideIcon } from "lucide-react";

export interface DifferentiatorItem {
  number?: string;
  title: string;
  description: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
}

export interface DifferentiatorListProps {
  title: string;
  items: DifferentiatorItem[];
  backgroundColor?: string;
}

export const DifferentiatorList: React.FC<DifferentiatorListProps> = ({
  title,
  items,
  backgroundColor = "#0a0f18",
}) => {
  return (
    <section className={`py-24 bg-[${backgroundColor}] border-t border-border/10`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-white mb-16 text-center">{title}</h2>

        <div className="max-w-5xl mx-auto space-y-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="group flex flex-col sm:flex-row items-start sm:items-center p-6 sm:p-8 bg-card/5 border border-border/20 rounded-lg hover:border-primary/40 hover:bg-card/10 transition-all duration-300"
              >
                <div className="flex items-center gap-4 sm:w-1/3 mb-4 sm:mb-0">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-105 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h3>
                </div>

                <div className="sm:w-2/3 sm:pl-12 sm:border-l border-border/20">
                  <p className="text-gray-400 text-base md:text-lg leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DifferentiatorList;
