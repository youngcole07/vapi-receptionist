import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import LeadsTable from "@/components/leads/leads-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

export default function Leads() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("");

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

  const { data: leads, isLoading: leadsLoading } = useQuery({
    queryKey: ["/api/leads", { search, service: serviceFilter }],
    enabled: isAuthenticated,
  });

  const favoriteMutation = useMutation({
    mutationFn: async ({ leadId, isFavorite }: { leadId: number; isFavorite: boolean }) => {
      await apiRequest("PUT", `/api/leads/${leadId}/favorite`, { isFavorite });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Update Failed",
        description: "Failed to update lead. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFavorite = (leadId: number, isFavorite: boolean) => {
    favoriteMutation.mutate({ leadId, isFavorite });
  };

  if (isLoading || !isAuthenticated) {
    return null;
  }

  // Get unique services for filter
  const services = user?.serviceList || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Leads" 
          subtitle="Manage and follow up with your prospects"
          agentStatus={user?.agentStatus === 'active'}
          phoneNumber={user?.vapiPhoneNumber}
        />
        
        <div className="p-6">
          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search leads..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                    <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Select value={serviceFilter} onValueChange={setServiceFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Services" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Services</SelectItem>
                      {services.map((service: string) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <LeadsTable
            leads={leads || []}
            isLoading={leadsLoading}
            onFavorite={handleFavorite}
          />
        </div>
      </div>
    </div>
  );
}
