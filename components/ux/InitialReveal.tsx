"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

export default function InitialReveal() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(8px)" as any }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" as any }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" as any }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed inset-0 z-[60] bg-black/20 flex items-center justify-center"
        >
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5 }}>
            <Image src="/assets/logos/marconi_header_orangewhite.png" alt="Marconi" width={220} height={70} priority />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}