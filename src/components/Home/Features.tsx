import React from "react";
import { motion } from "framer-motion";
// import { Shield, Link2, Users } from "lucide-react";

const features = [
  {
    image: "/F1.png",
    title: "Verified Credentials",
    description: "Resume authenticity verified on Aptos blockchain",
  },
  {
    image: "/F2.png",
    title: "Transparent Hiring",
    description: "Every action recorded with immutable proof",
  },
  {
    image: "/F3.png",
    title: "Trust Network",
    description: "Connect with verified alumni for referrals",
  },
];

const Features = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mb-40 min-h-[600px] w-full px-4"
    >
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold  mb-4 leading-tight text-foreground">
        Features  <span className="gradient-text3">that Feels </span>Human
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 tracking-tight">
        It amplifies human insight and recommendations, to help incredible
        people find each other.
      </p>
      <div className="grid sm:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Image = feature.image;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="bg-card w-full h-96 rounded-xl border border-border/50 relative p-2"
            >
              <div className="w-full h-full rounded-lg border border-border/50 relative overflow-hidden flex flex-col items-start justify-end">
                <img
                  src={Image}
                  alt={feature.title}
                  className="absolute w-full h-full rounded-lg object-cover object-center z-0"
                />
                <div className="flex flex-col items-start justify-end px-4 pb-2">
                  <h3 className="font-bold text-2xl text-muted-foreground mb-1 z-10">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground z-10">
                    {feature.description}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-5"></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Features;
