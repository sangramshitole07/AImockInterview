'use client';

import { motion } from 'framer-motion';
import { 
  Code, 
  Zap, 
  Target, 
  Cpu, 
  Database, 
  Globe, 
  Shield, 
  Rocket,
  Brain,
  Smartphone,
  Network,
  BookOpen,
  BarChart3,
  Layers,
  Settings,
  GitBranch,
  Server,
  Monitor,
  Atom
} from 'lucide-react';

interface Language {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: 'Programming' | 'Framework' | 'Domain' | 'Fundamentals';
}

const languages: Language[] = [
  // Programming Languages
  {
    name: 'JavaScript',
    icon: <Code className="w-8 h-8" />,
    color: 'from-yellow-400 to-orange-500',
    description: 'Web development & Node.js',
    difficulty: 'Beginner',
    category: 'Programming'
  },
  {
    name: 'Python',
    icon: <Zap className="w-8 h-8" />,
    color: 'from-blue-400 to-green-500',
    description: 'Data science & Backend',
    difficulty: 'Beginner',
    category: 'Programming'
  },
  {
    name: 'Java',
    icon: <Target className="w-8 h-8" />,
    color: 'from-red-400 to-red-600',
    description: 'Enterprise & Android',
    difficulty: 'Intermediate',
    category: 'Programming'
  },
  {
    name: 'C++',
    icon: <Cpu className="w-8 h-8" />,
    color: 'from-blue-600 to-purple-600',
    description: 'Systems & Performance',
    difficulty: 'Advanced',
    category: 'Programming'
  },
  {
    name: 'TypeScript',
    icon: <Code className="w-8 h-8" />,
    color: 'from-blue-500 to-blue-700',
    description: 'Type-safe JavaScript',
    difficulty: 'Intermediate',
    category: 'Programming'
  },
  {
    name: 'Go',
    icon: <Rocket className="w-8 h-8" />,
    color: 'from-cyan-500 to-blue-600',
    description: 'Cloud & Microservices',
    difficulty: 'Intermediate',
    category: 'Programming'
  },
  {
    name: 'Rust',
    icon: <Shield className="w-8 h-8" />,
    color: 'from-orange-500 to-red-600',
    description: 'Memory safety & Performance',
    difficulty: 'Advanced',
    category: 'Programming'
  },
  {
    name: 'SQL',
    icon: <Database className="w-8 h-8" />,
    color: 'from-green-500 to-blue-600',
    description: 'Database & Data Analysis',
    difficulty: 'Beginner',
    category: 'Programming'
  },

  // Frameworks & Technologies
  {
    name: 'React',
    icon: <Atom className="w-8 h-8" />,
    color: 'from-cyan-400 to-blue-500',
    description: 'Frontend library & ecosystem',
    difficulty: 'Intermediate',
    category: 'Framework'
  },
  {
    name: 'Next.js',
    icon: <Globe className="w-8 h-8" />,
    color: 'from-gray-700 to-gray-900',
    description: 'Full-stack React framework',
    difficulty: 'Intermediate',
    category: 'Framework'
  },
  {
    name: 'Node.js',
    icon: <Server className="w-8 h-8" />,
    color: 'from-green-600 to-green-800',
    description: 'Backend JavaScript runtime',
    difficulty: 'Intermediate',
    category: 'Framework'
  },

  // Specialized Domains
  {
    name: 'Data Science',
    icon: <BarChart3 className="w-8 h-8" />,
    color: 'from-purple-500 to-pink-600',
    description: 'Analytics & Statistical modeling',
    difficulty: 'Intermediate',
    category: 'Domain'
  },
  {
    name: 'Machine Learning',
    icon: <Brain className="w-8 h-8" />,
    color: 'from-indigo-500 to-purple-600',
    description: 'AI & ML algorithms',
    difficulty: 'Advanced',
    category: 'Domain'
  },
  {
    name: 'NLP',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-teal-500 to-cyan-600',
    description: 'Natural Language Processing',
    difficulty: 'Advanced',
    category: 'Domain'
  },
  {
    name: 'App Development',
    icon: <Smartphone className="w-8 h-8" />,
    color: 'from-pink-500 to-rose-600',
    description: 'Mobile & Cross-platform',
    difficulty: 'Intermediate',
    category: 'Domain'
  },

  // Computer Science Fundamentals
  {
    name: 'Data Structures & Algorithms',
    icon: <Layers className="w-8 h-8" />,
    color: 'from-emerald-500 to-teal-600',
    description: 'DSA concepts & problem solving',
    difficulty: 'Intermediate',
    category: 'Fundamentals'
  },
  {
    name: 'Object-Oriented Programming',
    icon: <Settings className="w-8 h-8" />,
    color: 'from-violet-500 to-purple-600',
    description: 'OOP principles & design patterns',
    difficulty: 'Intermediate',
    category: 'Fundamentals'
  },
  {
    name: 'Computer Networks',
    icon: <Network className="w-8 h-8" />,
    color: 'from-blue-500 to-indigo-600',
    description: 'Networking protocols & concepts',
    difficulty: 'Intermediate',
    category: 'Fundamentals'
  },
  {
    name: 'Database Management',
    icon: <Database className="w-8 h-8" />,
    color: 'from-green-600 to-emerald-700',
    description: 'DBMS concepts & design',
    difficulty: 'Intermediate',
    category: 'Fundamentals'
  },
  {
    name: 'Software Engineering',
    icon: <GitBranch className="w-8 h-8" />,
    color: 'from-slate-600 to-gray-700',
    description: 'SDLC & best practices',
    difficulty: 'Intermediate',
    category: 'Fundamentals'
  },
  {
    name: 'Operating Systems',
    icon: <Monitor className="w-8 h-8" />,
    color: 'from-amber-500 to-orange-600',
    description: 'OS concepts & system programming',
    difficulty: 'Advanced',
    category: 'Fundamentals'
  },
];

interface LanguageSelectorProps {
  onSelect: (language: string) => void;
}

export function LanguageSelector({ onSelect }: LanguageSelectorProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Programming': return 'bg-blue-50 border-blue-200';
      case 'Framework': return 'bg-purple-50 border-purple-200';
      case 'Domain': return 'bg-pink-50 border-pink-200';
      case 'Fundamentals': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const categories = ['Programming', 'Framework', 'Domain', 'Fundamentals'];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          Choose Your Interview Topic
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Select from programming languages, frameworks, specialized domains, or computer science fundamentals 
          to begin your personalized technical interview experience
        </p>
      </div>
      
      {categories.map((category) => {
        const categoryLanguages = languages.filter(lang => lang.category === category);
        
        return (
          <div key={category} className="space-y-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-xl font-semibold text-gray-800">{category}</h3>
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-sm text-gray-500">{categoryLanguages.length} options</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {categoryLanguages.map((language, index) => (
                <motion.button
                  key={language.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelect(language.name)}
                  className={`group relative overflow-hidden rounded-xl p-5 bg-white border-2 hover:border-transparent hover:shadow-xl transition-all duration-300 ${getCategoryColor(language.category)}`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${language.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                  
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-lg bg-gradient-to-r ${language.color} text-white`}>
                        {language.icon}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(language.difficulty)}`}>
                        {language.difficulty}
                      </span>
                    </div>
                    
                    <div className="text-left">
                      <h4 className="font-semibold text-base text-gray-800 group-hover:text-gray-900 mb-1">
                        {language.name}
                      </h4>
                      <p className="text-sm text-gray-600 group-hover:text-gray-700 leading-relaxed">
                        {language.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
      
      <div className="text-center pt-4">
        <p className="text-sm text-gray-500">
          💡 Each topic includes tailored questions, real-world scenarios, and adaptive difficulty based on your performance
        </p>
      </div>
    </div>
  );
}