import React from 'react'
import { motion } from 'motion/react';
import {
  Shield,
  Link2,
  Users
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Credentials',
    description: 'Resume authenticity verified on Aptos blockchain',
  },
  {
    icon: Link2,
    title: 'Transparent Process',
    description: 'Every action recorded with immutable proof',
  },
  {
    icon: Users,
    title: 'Trust Network',
    description: 'Connect with verified alumni for referrals',
  },
];

const Features = () => {
  return (
    <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid sm:grid-cols-3 gap-6 mb-16"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>
  )
}

export default Features