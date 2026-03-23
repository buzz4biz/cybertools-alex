import { ReactNode } from "react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  iconBg: "primary" | "success" | "info" | "warning" | "destructive";
}

const bgMap = {
  primary: "bg-primary",
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

const fgMap = {
  primary: "text-primary-foreground",
  success: "text-success-foreground",
  info: "text-info-foreground",
  warning: "text-warning-foreground",
  destructive: "text-destructive-foreground",
};

export function KpiCard({ title, value, subtitle, icon, iconBg }: KpiCardProps) {
  return (
    <div className="bg-card rounded-lg p-5 card-shadow hover:card-shadow-hover transition-shadow duration-200 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-card-foreground mt-2">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${bgMap[iconBg]} ${fgMap[iconBg]} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
