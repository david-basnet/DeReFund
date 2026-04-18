import { CheckCircle, XCircle, Clock, AlertCircle, ShieldCheck, FileText, Building2 } from 'lucide-react';

const CampaignStatusBadge = ({ status, size = 'sm' }) => {
  const statusMap = {
    LIVE: {
      bg: 'bg-secondary-container/35',
      text: 'text-on-secondary-container',
      icon: CheckCircle,
      label: 'Live',
    },
    COMPLETED: {
      bg: 'bg-primary-container/25',
      text: 'text-primary-container',
      icon: CheckCircle,
      label: 'Completed',
    },
    CANCELLED: {
      bg: 'bg-error-container',
      text: 'text-on-error-container',
      icon: XCircle,
      label: 'Cancelled',
    },
    PENDING_ADMIN_APPROVAL: {
      bg: 'bg-primary-fixed/60',
      text: 'text-primary',
      icon: Clock,
      label: 'Pending admin approval',
    },
    PENDING_NGO_VERIFICATION: {
      bg: 'bg-tertiary-fixed/50',
      text: 'text-tertiary',
      icon: Building2,
      label: 'Awaiting NGO',
    },
    VERIFIED_BY_VOLUNTEERS: {
      bg: 'bg-secondary-fixed/60',
      text: 'text-on-secondary-fixed',
      icon: ShieldCheck,
      label: 'Volunteer verified',
    },
    PENDING_VERIFICATION: {
      bg: 'bg-tertiary-container/25',
      text: 'text-tertiary-container',
      icon: AlertCircle,
      label: 'Pending verification',
    },
    DRAFT: {
      bg: 'bg-surface-container-high',
      text: 'text-on-surface-variant',
      icon: FileText,
      label: 'Draft',
    },
  };

  const config = statusMap[status] || {
    bg: 'bg-surface-container-high',
    text: 'text-on-surface-variant',
    icon: AlertCircle,
    label: status || 'Unknown',
  };
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-bold tracking-tight ring-1 ring-outline-variant/25 ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      <Icon className={`${size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'}`} />
      {config.label}
    </span>
  );
};

export default CampaignStatusBadge;
