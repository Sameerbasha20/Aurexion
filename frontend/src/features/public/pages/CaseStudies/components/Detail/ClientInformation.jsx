import React from "react";

export const ClientInformation = ({ caseStudy }) => {
  const fields = [
    { label: "CLIENT / PROJECT", value: caseStudy.client },
    { label: "INDUSTRY", value: caseStudy.industry.replace('-', ' ').toUpperCase() },
    { label: "CLIENT TYPE", value: caseStudy.clientType },
    { label: "COUNTRY", value: caseStudy.country },
    { label: "PROJECT CATEGORY", value: caseStudy.category }
  ];

  return (
    <section className="bg-card border-b border-border/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap divide-y sm:divide-y-0 sm:divide-x divide-border/20">
          {fields.map((field, idx) => (
            <div key={idx} className="flex-1 min-w-[200px] py-6 sm:px-6 first:pl-0 last:pr-0">
              <span className="block text-xs font-mono font-bold text-muted-foreground tracking-wider mb-2">
                {field.label}
              </span>
              <span className="block font-bold text-foreground">
                {field.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
