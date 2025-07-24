import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatsCard } from "@/components/ui/stats-card";
import { ProfileCard } from "@/components/ui/profile-card";
import { Users, Handshake, TrendingUp, Clock, Plus, Filter } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { UserWithProfile } from "@/types";
import { useLocation } from "wouter";

export default function InvestorDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: entrepreneurs = [], isLoading } = useQuery<UserWithProfile[]>({
    queryKey: ["/api/users", { role: "entrepreneur" }],
    queryFn: () => 
      fetch("/api/users?role=entrepreneur", { credentials: "include" })
        .then(res => res.json()),
  });

  const handleMessage = (userId: number) => {
    setLocation(`/chat/${userId}`);
  };

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
                  Investor Dashboard - Discover promising entrepreneurs
                </p>
              </div>
              <div className="flex space-x-3 mt-4 lg:mt-0">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Connection
                </Button>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Connections"
            value="284"
            icon={Users}
            iconColor="text-primary"
            iconBgColor="bg-primary/10"
          />
          <StatsCard
            title="Active Deals"
            value="12"
            icon={Handshake}
            iconColor="text-emerald-600"
            iconBgColor="bg-emerald-100"
          />
          <StatsCard
            title="Portfolio Value"
            value="$2.4M"
            icon={TrendingUp}
            iconColor="text-amber-600"
            iconBgColor="bg-amber-100"
          />
          <StatsCard
            title="Pending Reviews"
            value="8"
            icon={Clock}
            iconColor="text-red-600"
            iconBgColor="bg-red-100"
          />
        </div>

        {/* Entrepreneur Profiles */}
        <Card>
          <CardHeader>
            <CardTitle>Featured Entrepreneurs</CardTitle>
            <CardDescription>
              Discover promising startups seeking investment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-slate-200 rounded-lg h-48"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entrepreneurs.map((entrepreneur) => (
                  <ProfileCard
                    key={entrepreneur.id}
                    user={entrepreneur}
                    onMessage={handleMessage}
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
