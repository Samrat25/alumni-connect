import React from "react";

const Footer = () => {
  return (
    <footer className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-xl mt-auto">
      <div className="container mx-auto px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          ChainRefer — Prototype Demo • Built on{" "}
          <span className="text-primary font-medium">Aptos</span>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
