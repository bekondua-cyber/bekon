"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export interface TeamMember {
  id: string;
  name: string;
  role: string | null;
  bio: string | null;
  photo: string | null;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface TeamSectionProps {
  items: TeamMember[];
}

export function TeamSection({ items }: TeamSectionProps) {
  if (items.length === 0) return null;

  return (
    <section
      id="tim-kami"
      aria-label="Tim Kami"
      className="bg-bekon-off-white py-20 md:py-28"
    >
      <div className="max-w-container mx-auto px-6 lg:px-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="section-label">Tim</span>
          <h2 className="font-display text-[clamp(28px,3.5vw,42px)] text-bekon-near-black mt-5">
            Tim Kami
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-white rounded-xl p-6 border border-bekon-border text-center"
            >
              {member.photo ? (
                <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4 relative">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full bg-bekon-gold/10 flex items-center justify-center text-bekon-gold font-display text-2xl font-semibold mx-auto mb-4">
                  {getInitials(member.name)}
                </div>
              )}
              <h3 className="font-semibold text-bekon-near-black">
                {member.name}
              </h3>
              {member.role && (
                <p className="text-bekon-gold text-sm font-medium mt-0.5 mb-2">
                  {member.role}
                </p>
              )}
              {member.bio && (
                <p className="text-bekon-text-muted text-xs leading-relaxed">
                  {member.bio}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
