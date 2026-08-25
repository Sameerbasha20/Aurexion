import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const CategoryNavigation = ({ categories, activeCategory, setActiveCategory }: { categories: any[]; activeCategory: any; setActiveCategory: any }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const scroll = (direction: any) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -240 : 240;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleWheel = (e: any) => {
    if (scrollRef.current && e.deltaY !== 0) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div id="categories" className="w-full border-b border-[rgba(140,174,187,0.15)] mb-10 bg-[#050811]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center group py-2">
          {/* Scroll Left Button */}
          <button type="button"
            onClick={() => scroll("left")}
            aria-label="Scroll Left"
            className="hidden sm:flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-[#0a111c] border border-[rgba(99,245,232,0.2)] text-[#63f5e8] hover:bg-[#63f5e8] hover:text-[#041014] transition-all mr-2 shadow-md"
          >
            <ChevronLeft size={16} />
          </button>

          {/* Scrollable Container */}
          <div 
            ref={scrollRef}
            onWheel={handleWheel}
            className="flex flex-1 overflow-x-auto hide-scrollbar gap-2 py-1 scroll-smooth"
            style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
          >
            <button type="button"
              onClick={() => setActiveCategory("")}
              className={`whitespace-nowrap px-4 py-2 text-xs font-semibold tracking-wider rounded-md transition-all shrink-0 ${
                activeCategory === ""
                  ? "bg-[#63f5e8] text-[#041014] shadow-[0_0_15px_rgba(99,245,232,0.25)] font-bold"
                  : "text-[#8da5ae] hover:text-white hover:bg-[rgba(140,174,187,0.08)]"
              }`}
            >
              ALL CATEGORIES
            </button>
            
            {categories.map(category => {
              const isActive = activeCategory === category.slug;
              return (
                <button type="button"
                  key={category.slug}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`whitespace-nowrap px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-all shrink-0 ${
                    isActive
                      ? "bg-[#63f5e8] text-[#041014] shadow-[0_0_15px_rgba(99,245,232,0.25)] font-bold"
                      : "text-[#8da5ae] hover:text-white hover:bg-[rgba(140,174,187,0.08)]"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button type="button"
            onClick={() => scroll("right")}
            aria-label="Scroll Right"
            className="hidden sm:flex shrink-0 items-center justify-center h-8 w-8 rounded-full bg-[#0a111c] border border-[rgba(99,245,232,0.2)] text-[#63f5e8] hover:bg-[#63f5e8] hover:text-[#041014] transition-all ml-2 shadow-md"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};


