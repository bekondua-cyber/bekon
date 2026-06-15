"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
}

export function FAQSection({ items, title }: FAQSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-bekon-near-black mb-6">
          {title}
        </h2>
      )}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-bekon-border rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left"
            >
              <span className="font-medium text-bekon-near-black text-sm pr-4">
                {item.question}
              </span>
              <ChevronDown
                size={18}
                className={`text-bekon-gold shrink-0 transition-transform duration-200 ${
                  openIndex === i ? "rotate-180" : ""
                }`}
              />
            </button>
            <div
              className={`overflow-hidden transition-all duration-200 ${
                openIndex === i ? "max-h-96" : "max-h-0"
              }`}
            >
              <p className="px-5 pb-4 text-bekon-text-muted text-sm leading-relaxed">
                {item.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
