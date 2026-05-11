import { motion } from "framer-motion";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  return (
    <main 
      id="main-content" 
      className="min-h-[calc(100vh-4rem)] bg-slate-50"
    >
      <motion.div 
        className="p-4 sm:p-6 lg:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </main>
  );
}
