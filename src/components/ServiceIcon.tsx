import React from 'react';
import { 
  Wrench, 
  Zap, 
  Wind, 
  Cpu, 
  Hammer, 
  Brush, 
  Key, 
  Sparkles, 
  Bug, 
  Tv, 
  Flower, 
  Boxes,
  Activity
} from 'lucide-react';

interface Props {
  id: string;
  className?: string;
}

export const ServiceIcon: React.FC<Props> = ({ id, className = "w-6 h-6" }) => {
  switch (id) {
    case 'plumbing':
      return <Wrench className={className} />;
    case 'electrical':
      return <Zap className={className} />;
    case 'hvac':
      return <Wind className={className} />;
    case 'appliance-repair':
      return <Cpu className={className} />;
    case 'carpenter':
      return <Hammer className={className} />;
    case 'painting':
      return <Brush className={className} />;
    case 'locksmith':
      return <Key className={className} />;
    case 'cleaning':
      return <Sparkles className={className} />;
    case 'pest-control':
      return <Bug className={className} />;
    case 'smart-home':
      return <Tv className={className} />;
    case 'gardening':
      return <Flower className={className} />;
    case 'handyman':
      return <Boxes className={className} />;
    default:
      return <Activity className={className} />;
  }
};
