import { motion } from 'framer-motion'
import { 
  Brain, 
  Fingerprint, 
  Zap, 
  Heart, 
  Users2, 
  TrendingUp
} from 'lucide-react'

export function PsychometryVisual() {
  const tests = [
    {
      icon: <Brain className="h-8 w-8" />,
      color: "bg-blue-500",
      label: "Big Five"
    },
    {
      icon: <Fingerprint className="h-8 w-8" />,
      color: "bg-purple-500",
      label: "MBTI"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      color: "bg-orange-500",
      label: "DISC"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      color: "bg-pink-500",
      label: "EQ"
    },
    {
      icon: <Users2 className="h-8 w-8" />,
      color: "bg-emerald-500",
      label: "Soft Skills"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      color: "bg-amber-500",
      label: "Motivation"
    }
  ]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { opacity: 1, scale: 1, y: 0 }
  }

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center p-4 md:p-8">
      {/* Background blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-3xl opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-500 rounded-full" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-purple-500 rounded-full" />
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
        className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative z-10 w-full"
      >
        {tests.map((test, index) => (
          <motion.div
            key={index}
            variants={item}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              transition: { duration: 0.2 } 
            }}
            className="group relative flex flex-col items-center justify-center p-6 rounded-[2rem] bg-background/80 backdrop-blur-xl border border-border shadow-lg transition-all duration-300 hover:shadow-2xl hover:border-primary/30 h-full"
          >
            <div className={`p-4 rounded-2xl ${test.color} text-white mb-4 shadow-inner group-hover:scale-110 transition-transform duration-300`}>
              {test.icon}
            </div>
            <span className="text-sm font-semibold tracking-tight text-center">
              {test.label}
            </span>
            
            {/* Decoration dots */}
            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className={`w-1.5 h-1.5 rounded-full ${test.color}`} />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
