import { Button } from "@/components/ui/button";
import { useAuth, useLogout } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Bell, MessageSquare, Users, BarChart3, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth();
  const logout = useLogout();
  const [location] = useLocation();

  const handleLogout = () => {
    logout.mutate();
  };

  const isActive = (path: string) => location === path;

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-slate-800">
                  Business<span className="text-primary">Nexus</span>
                </h1>
              </div>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link href={user.role === 'investor' ? '/dashboard/investor' : '/dashboard/entrepreneur'}>
                    <Button 
                      variant={isActive(`/dashboard/${user.role}`) ? "default" : "ghost"}
                      className="text-sm font-medium"
                    >
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/discover">
                    <Button 
                      variant={isActive('/discover') ? "default" : "ghost"}
                      className="text-sm font-medium"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Discover
                    </Button>
                  </Link>
                  <Link href="/messages">
                    <Button 
                      variant={isActive('/messages') ? "default" : "ghost"}
                      className="text-sm font-medium"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Messages
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Link href={`/profile/${user.id}`}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                  <AvatarFallback>
                    {user.firstName[0]}{user.lastName[0]}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
