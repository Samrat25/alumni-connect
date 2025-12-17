import React from "react";
import { motion } from "framer-motion";

const WorkProcess = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-card rounded-2xl p-8 border border-border/50"
    >
      <h2 className="text-2xl font-bold text-foreground mb-8">How It Works</h2>
      <div className="grid sm:grid-cols-3 gap-8">
        {[
          {
            step: "01",
            title: "Student Uploads",
            description: "Resume PDF uploaded, hash stored on Aptos blockchain",
            color: "student",
          },
          {
            step: "02",
            title: "Verifier Approves",
            description: "College authority verifies authenticity on-chain",
            color: "verifier",
          },
          {
            step: "03",
            title: "Alumni Refers",
            description: "Trusted referrals based on verified credentials",
            color: "alumni",
          },
        ].map((item, index) => (
          <div key={item.step} className="text-center">
            <div
              className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-${item.color}/10`}
            >
              <span className={`text-2xl font-bold text-${item.color}`}>
                {item.step}
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
            {/* {index < 2 && (
              <div className="hidden sm:block absolute top-8 right-0 w-8 h-0.5 bg-border" />
            )} */}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WorkProcess;
