import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import StatsCard from "@/components/ui/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Phone, Users, Clock, TrendingUp, User, ArrowRight } from "lucide-react";

interface Stats {
  totalCalls: number;
  newLeads: number;
  avgCallTime: string;
  conversionRate: string;
}

interface RecentLead {
  id: number;
  name: string;
  phone: string;
  service: string;
  createdAt: string;
}

export default function Home() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    enabled: isAuthenticated,
  });

  const { data: recentLeads } = useQuery<RecentLead[]>({
    queryKey: ["/api/leads", { limit: 5 }],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Dashboard" 
          subtitle="Monitor your AI receptionist performance"
          agentStatus={user?.agentStatus === 'active'}
          phoneNumber={user?.vapiPhoneNumber}
        />
        
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Calls"
              value={stats?.totalCalls?.toString() || "0"}
              icon={Phone}
              color="primary"
            />
            <StatsCard
              title="New Leads"
              value={stats?.newLeads?.toString() || "0"}
              icon={Users}
              color="accent"
            />
            <StatsCard
              title="Avg Call Time"
              value={stats?.avgCallTime || "0:00"}
              icon={Clock}
              color="yellow"
            />
            <StatsCard
              title="Conversion Rate"
              value={stats?.conversionRate || "0%"}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {/* Recent Activity & Setup Status */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Leads */}
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle>Recent Leads</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {recentLeads && recentLeads.length > 0 ? (
                  <div className="space-y-3">
                    {recentLeads.map((lead) => (
                      <div key={lead.id} className="flex items-center py-3 border-b border-slate-100 last:border-0">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{lead.name}</p>
                          <p className="text-sm text-slate-600">{lead.service}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-slate-900">{lead.phone}</p>
                          <p className="text-xs text-slate-500">
                            {new Date(lead.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    <div className="mt-4">
                      <Button variant="ghost" size="sm" asChild>
                        <a href="/leads">
                          View all leads <ArrowRight className="ml-1 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No leads yet</p>
                    <p className="text-sm text-slate-400">Leads will appear here when your AI handles calls</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* AI Agent Status */}
            <Card>
              <CardHeader className="border-b border-slate-200">
                <CardTitle>AI Agent Status</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      user?.agentStatus === 'active' ? 'bg-accent' : 'bg-slate-400'
                    }`}></div>
                    <span className="font-medium text-slate-900">
                      {user?.agentStatus === 'active' ? 'Agent Active' : 'Setup Required'}
                    </span>
                  </div>
                  <span className="text-sm text-slate-600">
                    {user?.agentStatus === 'active' ? 'Ready to handle calls' : 'Not configured'}
                  </span>
                </div>

                {user?.agentStatus === 'active' ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Phone Number:</span>
                      <span className="text-sm font-medium text-slate-900">
                        {user.vapiPhoneNumber || 'Not assigned'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Voice:</span>
                      <span className="text-sm font-medium text-slate-900">
                        {user.preferredVoice || 'Rachel'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-600">Model:</span>
                      <span className="text-sm font-medium text-slate-900">GPT-4</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-600 mb-4">
                      Complete your agent setup to start receiving leads
                    </p>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-slate-200">
                  <Button variant="outline" className="w-full" asChild>
                    <a href="/setup">
                      {user?.agentStatus === 'active' ? 'Edit Agent Settings' : 'Setup Agent'}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
