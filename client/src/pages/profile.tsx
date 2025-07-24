import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, UserPlus, Mail, Phone, Linkedin, Download } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserWithProfile } from "@/types";
import { useRoute, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { user: currentUser } = useAuth();
  const [, params] = useRoute("/profile/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const userId = params?.id ? parseInt(params.id) : null;
  
  const { data: user, isLoading } = useQuery<UserWithProfile>({
    queryKey: ["/api/users", userId],
    queryFn: () => 
      fetch(`/api/users/${userId}`, { credentials: "include" })
        .then(res => res.json()),
    enabled: !!userId,
  });

  const createCollaborationRequestMutation = useMutation({
    mutationFn: async (data: { toUserId: number; message: string }) => {
      const response = await apiRequest("POST", "/api/collaboration-requests", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Request sent!",
        description: "Your collaboration request has been sent successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnect = () => {
    if (!user) return;
    
    const message = currentUser?.role === 'investor' 
      ? `Hi ${user.firstName}, I'm interested in learning more about your startup and discussing potential investment opportunities.`
      : `Hi ${user.firstName}, I'd like to connect and explore potential collaboration opportunities.`;
    
    createCollaborationRequestMutation.mutate({
      toUserId: user.id,
      message,
    });
  };

  const handleMessage = () => {
    if (!user) return;
    setLocation(`/chat/${user.id}`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="bg-slate-200 rounded-lg h-64"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-200 rounded-lg h-32"></div>
              <div className="bg-slate-200 rounded-lg h-48"></div>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-200 rounded-lg h-32"></div>
              <div className="bg-slate-200 rounded-lg h-32"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-slate-900">User not found</h2>
        </div>
      </DashboardLayout>
    );
  }

  const { profile } = user;
  const isOwnProfile = currentUser?.id === user.id;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Profile Header */}
        <Card>
          <div className="relative">
            <div className="h-48 bg-gradient-to-r from-primary to-primary/80 rounded-t-lg"></div>
            <div className="absolute -bottom-16 left-6">
              <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                <AvatarFallback className="text-2xl">
                  {user.firstName[0]}{user.lastName[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          <CardContent className="pt-20 p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-slate-900">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-lg text-slate-600 mt-1">
                  {user.role === 'entrepreneur' 
                    ? `CEO & Founder${profile?.companyName ? ` at ${profile.companyName}` : ''}`
                    : 'Investor'
                  }
                </p>
                <p className="text-slate-600 mt-2">
                  {profile?.location} • 500+ connections
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {user.role === 'entrepreneur' ? (
                    <>
                      {profile?.industry && (
                        <Badge>{profile.industry}</Badge>
                      )}
                      {profile?.fundingStage && (
                        <Badge variant="outline">{profile.fundingStage}</Badge>
                      )}
                    </>
                  ) : (
                    profile?.investmentInterests?.slice(0, 3).map((interest, index) => (
                      <Badge key={index} variant="secondary">{interest}</Badge>
                    ))
                  )}
                </div>
              </div>
              {!isOwnProfile && (
                <div className="flex space-x-3 mt-6 lg:mt-0">
                  <Button onClick={handleMessage}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button variant="outline" onClick={handleConnect}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profile Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About</h2>
                <p className="text-slate-700 leading-relaxed">
                  {profile?.bio || "No bio available."}
                </p>
              </CardContent>
            </Card>

            {/* Role-specific content */}
            {user.role === 'entrepreneur' && profile && (
              <>
                {/* Startup Details */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Startup Details</h2>
                    <div className="space-y-4">
                      {profile.companyName && (
                        <div>
                          <h3 className="font-medium text-slate-900">Company</h3>
                          <p className="text-slate-600">{profile.companyName}</p>
                        </div>
                      )}
                      {profile.industry && (
                        <div>
                          <h3 className="font-medium text-slate-900">Industry</h3>
                          <p className="text-slate-600">{profile.industry}</p>
                        </div>
                      )}
                      {profile.fundingStage && (
                        <div>
                          <h3 className="font-medium text-slate-900">Stage</h3>
                          <p className="text-slate-600">
                            {profile.fundingStage}
                            {profile.fundingGoal && ` - Seeking ${profile.fundingGoal}`}
                          </p>
                        </div>
                      )}
                      {profile.companyDescription && (
                        <div>
                          <h3 className="font-medium text-slate-900">Description</h3>
                          <p className="text-slate-600">{profile.companyDescription}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Pitch Deck */}
                {profile.pitchDeckUrl && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold text-slate-900 mb-4">Pitch Deck</h2>
                      <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                        <Download className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-600 mb-4">Pitch Deck Available</p>
                        <Button>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {user.role === 'investor' && profile && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-slate-900 mb-4">Investment Focus</h2>
                  <div className="space-y-4">
                    {profile.investmentRange && (
                      <div>
                        <h3 className="font-medium text-slate-900">Investment Range</h3>
                        <p className="text-slate-600">{profile.investmentRange}</p>
                      </div>
                    )}
                    {profile.investmentInterests && profile.investmentInterests.length > 0 && (
                      <div>
                        <h3 className="font-medium text-slate-900">Investment Interests</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {profile.investmentInterests.map((interest, index) => (
                            <Badge key={index} variant="secondary">{interest}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {profile.portfolioCompanies && profile.portfolioCompanies.length > 0 && (
                      <div>
                        <h3 className="font-medium text-slate-900">Portfolio Companies</h3>
                        <p className="text-slate-600">{profile.portfolioCompanies.join(", ")}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-600 ml-3">{user.email}</span>
                  </div>
                  {profile?.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-600 ml-3">{profile.phone}</span>
                    </div>
                  )}
                  {profile?.linkedin && (
                    <div className="flex items-center">
                      <Linkedin className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-600 ml-3">{profile.linkedin}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Team Members (for entrepreneurs) */}
            {user.role === 'entrepreneur' && profile?.teamMembers && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Team</h3>
                  <div className="space-y-3">
                    {profile.teamMembers.map((member: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.image} alt={member.name} />
                          <AvatarFallback>
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium text-slate-900">{member.name}</p>
                          <p className="text-sm text-slate-600">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
