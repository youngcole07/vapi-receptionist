interface HeaderProps {
  title: string;
  subtitle: string;
  agentStatus?: boolean;
  phoneNumber?: string;
}

export default function Header({ title, subtitle, agentStatus, phoneNumber }: HeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* Status Indicator */}
          <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            agentStatus 
              ? "bg-accent/10 text-accent" 
              : "bg-slate-100 text-slate-600"
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              agentStatus ? "bg-accent" : "bg-slate-400"
            }`}></div>
            {agentStatus ? "Agent Active" : "Setup Required"}
          </div>
          
          {/* Phone Number Display */}
          {phoneNumber && (
            <div className="text-sm text-slate-600">
              <span className="font-medium">{phoneNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
