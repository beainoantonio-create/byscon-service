import React from 'react';
import { 
  Wrench, 
  Zap, 
  Paintbrush, 
  Columns3, 
  Grid3X3, 
  Notebook, 
  Boxes, 
  Snowflake, 
  Settings, 
  Sprout, 
  Shield, 
  Eye, 
  Cpu, 
  HardHat, 
  Map, 
  Palette, 
  Briefcase, 
  Hammer,
  Clock,
  Home,
  AlertTriangle,
  FolderSync,
  X,
  CheckCircle,
  FileText,
  Users,
  DollarSign,
  Plus,
  LogOut,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
}

export const ServiceIcon: React.FC<IconProps> = ({ name, className = "w-6 h-6" }) => {
  switch (name) {
    case 'Wrench':
      return <Wrench className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Paintbrush':
      return <Paintbrush className={className} />;
    case 'Columns3':
      return <Columns3 className={className} />;
    case 'Grid3X3':
      return <Grid3X3 className={className} />;
    case 'Notebook':
      return <Notebook className={className} />;
    case 'Boxes':
      return <Boxes className={className} />;
    case 'Snowflake':
      return <Snowflake className={className} />;
    case 'Settings':
      return <Settings className={className} />;
    case 'Sprout':
      return <Sprout className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Eye':
      return <Eye className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'HardHat':
      return <HardHat className={className} />;
    case 'Map':
      return <Map className={className} />;
    case 'Palette':
      return <Palette className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    case 'Hammer':
      return <Hammer className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'Home':
      return <Home className={className} />;
    case 'AlertTriangle':
      return <AlertTriangle className={className} />;
    case 'FolderSync':
      return <FolderSync className={className} />;
    case 'X':
      return <X className={className} />;
    case 'CheckCircle':
      return <CheckCircle className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'Users':
      return <Users className={className} />;
    case 'AdjustmentsHorizontal':
      return <Settings className={className} />;
    case 'DollarSign':
      return <DollarSign className={className} />;
    case 'Plus':
      return <Plus className={className} />;
    case 'LogOut':
      return <LogOut className={className} />;
    case 'ChevronRight':
      return <ChevronRight className={className} />;
    case 'ChevronLeft':
      return <ChevronLeft className={className} />;
    default:
      return <Hammer className={className} />;
  }
};
export default ServiceIcon;
