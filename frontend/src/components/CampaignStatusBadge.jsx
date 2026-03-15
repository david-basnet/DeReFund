import { CheckCircle, XCircle, Clock, AlertCircle, ShieldCheck, FileText } from 'lucide-react';

const CampaignStatusBadge = ({ status, size = 'sm' }) => {
  const statusMap = {
    LIVE: { 
      bg: 'bg-green', 
      text: 'text-white', 
      icon: CheckCircle,
      label: 'Live'
    },
    COMPLETED: { 
      bg: 'bg-purple', 
      text: 'text-white', 
      icon: CheckCircle,
      label: 'Completed'
    },
    CANCELLED: { 
      bg: 'bg-red', 
      text: 'text-white', 
      icon: XCircle,
      label: 'Cancelled'
    },
    PENDING_ADMIN_APPROVAL: { 
      bg: 'bg-yellow', 
      text: 'text-black', 
      icon: Clock,
      label: 'Pending Admin Approval'
    },
    VERIFIED_BY_VOLUNTEERS: { 
      bg: 'bg-blue', 
      text: 'text-white', 
      icon: ShieldCheck,
      label: 'Verified by Volunteers'
    },
    PENDING_VERIFICATION: { 
      bg: 'bg-orange', 
      text: 'text-white', 
      icon: AlertCircle,
      label: 'Pending Verification'
    },
    DRAFT: { 
      bg: 'bg-gray', 
      text: 'text-black', 
      icon: FileText,
      label: 'Draft'
    },
  };

  const config = statusMap[status] || { 
    bg: 'bg-gray-300', 
    text: 'text-black', 
    icon: AlertCircle,
    label: status || 'Unknown'
  };
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <span className={`inline-flex items-center gap-2 ${config.bg} ${config.text} rounded-full font-bold font-dmsans tracking-tight ${sizeClasses[size]}`}>
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
      {config.label}
    </span>
  );
};

export default CampaignStatusBadge;

