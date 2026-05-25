import React from 'react';
import { 
  Wrench, 
  Bolt, 
  Paintbrush, 
  LayoutGrid, 
  Hammer, 
  Wind, 
  Settings, 
  Leaf, 
  Shield, 
  ClipboardCheck, 
  Compass, 
  HardHat, 
  Palette,
  Construction,
  Briefcase
} from 'lucide-react';

interface Props {
  id: string;
  className?: string;
}

export const ServiceIcon: React.FC<Props> = ({ id, className = "w-6 h-6" }) => {
  switch (id) {
    case 'plumbing':
      return <Wrench className={className} />;
    case 'electricity':
      return <Bolt className={className} />;
    case 'paint':
      return <Paintbrush className={className} />;
    case 'aluminum':
      return <Construction className={className} />;
    case 'tiling':
      return <LayoutGrid className={className} />;
    case 'woodwork':
      return <Hammer className={className} />;
    case 'steelwork':
      return <Shield className={className} />;
    case 'ac':
      return <Wind className={className} />;
    case 'mechanical':
      return <Settings className={className} />;
    case 'gardening':
      return <Leaf className={className} />;
    case 'insulation':
      return <Shield className={className} />;
    case 'home-inspection':
      return <ClipboardCheck className={className} />;
    case 'mech-engineer':
      return <Settings className={className} />;
    case 'contractor':
      return <HardHat className={className} />;
    case 'architect':
      return <Compass className={className} />;
    case 'interior-design':
      return <Palette className={className} />;
    default:
      return <Briefcase className={className} />;
  }
};
