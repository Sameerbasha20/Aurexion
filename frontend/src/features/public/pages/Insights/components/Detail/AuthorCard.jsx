import React from "react";
import { authors } from "../../../../../../data/authors";

export const AuthorCard = ({ authorId }) => {
  const author = authors.find(a => a.id === authorId);
  
  if (!author) return null;

  return (
    <div className="bg-[#080f1a] border border-[rgba(99,245,232,0.2)] rounded-xl p-6 sm:p-8 mt-10 mb-8 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[rgba(99,245,232,0.03)] rounded-bl-full pointer-events-none" />
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border-2 border-[rgba(99,245,232,0.3)] flex-shrink-0 flex items-center justify-center overflow-hidden shadow-lg bg-[#0a1422]">
          {author.image ? (
            <img src={author.image} alt={author.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-3xl font-bold text-[#63f5e8] font-mono">{author.name.charAt(0)}</span>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
            <h4 className="text-xl font-bold text-white">{author.name}</h4>
            <span className="text-[10px] font-mono text-[#63f5e8] bg-[rgba(99,245,232,0.1)] px-2.5 py-0.5 rounded border border-[rgba(99,245,232,0.2)]">AUTHOR</span>
          </div>
          <p className="text-xs font-mono text-[#63f5e8] mb-3">{author.role}</p>
          <p className="text-sm text-[#8da5ae] leading-relaxed mb-4">
            {author.bio}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {author.expertise.map(exp => (
              <span key={exp} className="text-[10px] font-mono px-2 py-1 bg-[#0a1422] text-[#a2b5be] rounded border border-[rgba(140,174,187,0.15)]">
                {exp}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
