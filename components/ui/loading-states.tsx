"use client";

import { motion } from "framer-motion";
import { Loader2, Home, Sparkles } from "lucide-react";

// Loading spinner elegante
export function LoadingSpinner({ size = "default", className = "" }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    default: "w-8 h-8", 
    lg: "w-12 h-12"
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}
    >
      <Loader2 className="w-full h-full text-orange-500" />
    </motion.div>
  );
}

// Loading de propiedades con glassmorphism
export function PropertyLoadingCard() {
  return (
    <motion.div
      className="bg-gray-800/30 border border-gray-700/20 rounded-2xl overflow-hidden backdrop-blur-md h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Image skeleton */}
      <div className="relative h-64 bg-gray-700/50 shimmer">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {/* Content skeleton */}
      <div className="p-6 flex flex-col h-full">
        <motion.div 
          className="space-y-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Title skeleton */}
          <div className="h-6 bg-gray-600/50 rounded-lg skeleton-text" />
          
          {/* Location skeleton */}
          <div className="h-4 bg-gray-600/30 rounded w-3/4 skeleton-text" />
          
          {/* Price skeleton */}
          <div className="h-8 bg-gray-600/40 rounded w-1/2 skeleton-text" />
        </motion.div>
        
        {/* Details skeleton */}
        <div className="flex gap-6 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-gray-600/30 rounded w-12 skeleton-text" />
          ))}
        </div>
        
        {/* Button skeleton */}
        <div className="mt-auto pt-4 border-t border-gray-700/20">
          <div className="h-10 bg-gray-600/40 rounded-lg skeleton-text" />
        </div>
      </div>
    </motion.div>
  );
}

// Loading state para secciones completas
export function SectionLoading({ title = "Cargando...", description = "" }) {
  return (
    <motion.div
      className="text-center py-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="mb-8 flex justify-center"
        animate={{ rotate: [0, 360] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <div className="w-16 h-16 border-4 border-gray-600 border-t-orange-500 rounded-full" />
      </motion.div>
      
      <motion.h3 
        className="text-white text-xl mb-4 font-light"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p 
          className="text-gray-300 font-light"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {description}
        </motion.p>
      )}
    </motion.div>
  );
}

// Loading con efectos de partículas
export function ParticleLoader() {
  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 bg-orange-500 rounded-full"
          animate={{
            rotate: 360,
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeInOut"
          }}
          style={{
            transformOrigin: `${40 + i * 8}px`,
          }}
        />
      ))}
      
      <motion.div
        className="text-white text-lg font-light"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        Cargando experiencia premium...
      </motion.div>
    </div>
  );
}

// Loading grid para propiedades
export function PropertyGridLoading() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
      {[1, 2].map((i) => (
        <PropertyLoadingCard key={i} />
      ))}
    </div>
  );
}

// Success state animado
export function SuccessAnimation({ message = "¡Enviado exitosamente!" }) {
  return (
    <motion.div
      className="text-center py-8"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 10
      }}
    >
      <motion.div
        className="mb-4 flex justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            ✓
          </motion.div>
        </div>
      </motion.div>
      
      <motion.p
        className="text-white font-medium"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}

// Error state elegante
export function ErrorState({ 
  message = "Ha ocurrido un error", 
  onRetry = null 
}) {
  return (
    <motion.div
      className="text-center py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <span className="text-red-400 text-2xl">⚠</span>
      </motion.div>
      
      <p className="text-white text-lg mb-4">{message}</p>
      
      {onRetry && (
        <motion.button
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-colors"
          onClick={onRetry}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reintentar
        </motion.button>
      )}
    </motion.div>
  );
}

// Empty state elegante
export function EmptyState({ 
  icon: Icon = Home,
  title = "No hay contenido disponible",
  description = "Pronto agregaremos nuevo contenido",
  action = null
}) {
  return (
    <motion.div
      className="text-center py-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        className="mb-6 flex justify-center"
        animate={{ y: [0, -10, 0] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center">
          <Icon className="w-10 h-10 text-gray-400" />
        </div>
      </motion.div>
      
      <h3 className="text-white text-xl mb-3 font-medium">{title}</h3>
      <p className="text-gray-400 mb-8 max-w-md mx-auto">{description}</p>
      
      {action}
    </motion.div>
  );
}