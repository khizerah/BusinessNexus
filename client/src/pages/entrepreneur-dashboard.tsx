import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { CollaborationRequestCard } from "@/components/ui/collaboration-request-card";
import { Eye, Handshake, MessageSquare, Star, Plus, BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { CollaborationRequest } from "@/types";

export default function EntrepreneurDashboard() {
  const { user } = useAuth();

  const { data: collaborationRequests = [], isLoading } = useQuery<CollaborationRequest[]>({
    queryKey: ["/api/collaboration-requests"],
    queryFn: () => 
      fetch("/api/collaboration-requests", { credentials: "include" })
        .then(res => res.json()),
  });

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Welcome back, {user.firstName}!
                </h1>
                <p className="text-slate-600 mt-1">
                  Entrepreneur Dashboard - Manage your startup journey
                </p>
              </div>
              <div className="flex space-x-3 mt-4 lg:mt-0">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Update Profile
                </Button>
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Profile Views"
            value="1,247"
            icon={Eye}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatsCard
            title="Connection Requests"
            value="23"
            icon={Handshake}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
          />
          <StatsCard
            title="Active Conversations"
            value="8"
            icon={MessageSquare}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <StatsCard
            title="Interest Score"
            value="94%"
            icon={Star}
            iconColor="text-purple-600"
            iconBgColor="bg-purple-100"
          />
        </div>

        {/* Collaboration Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Collaboration Requests</CardTitle>
            <CardDescription>
              Investors interested in your startup
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 rounded-lg h-24"></div>
                  </div>
                ))}
              </div>
            ) : collaborationRequests.length === 0 ? (
              <div className="text-center py-8">
                <Handshake className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">
                  No collaboration requests yet
                </h3>
                <p className="text-slate-600">
                  When investors are interested in your startup, their requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {collaborationRequests.map((request) => (
                  <CollaborationRequestCard
                    key={request.id}
                    request={request}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
