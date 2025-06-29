import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import AgentSetupForm from "@/components/agent/agent-setup-form";

export default function Setup() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const setupMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/agent/setup", data);
    },
    onSuccess: () => {
      toast({
        title: "Agent Updated",
        description: "Your AI receptionist has been configured successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        title: "Setup Failed",
        description: "Failed to configure agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const testMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/agent/test", {});
    },
    onSuccess: () => {
      toast({
        title: "Test Initiated",
        description: "Test call has been initiated to verify your agent.",
      });
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
        title: "Test Failed",
        description: "Failed to initiate test call. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div className="ml-64">
        <Header 
          title="Agent Setup" 
          subtitle="Configure your AI receptionist"
          agentStatus={user?.agentStatus === 'active'}
          phoneNumber={user?.vapiPhoneNumber}
        />
        
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <AgentSetupForm
              user={user}
              onSubmit={(data) => setupMutation.mutate(data)}
              onTest={() => testMutation.mutate()}
              isSubmitting={setupMutation.isPending}
              isTesting={testMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
