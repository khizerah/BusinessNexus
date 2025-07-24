import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { UserWithProfile } from "@/types";
import { Link } from "wouter";

interface ProfileCardProps {
  user: UserWithProfile;
  onMessage?: (userId: number) => void;
}

export function ProfileCard({ user, onMessage }: ProfileCardProps) {
  const { profile } = user;
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center mb-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback>
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-semibold text-slate-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-slate-600">
              {user.role === 'entrepreneur' ? 'CEO & Founder' : 'Investor'}
            </p>
          </div>
        </div>
        
        {user.role === 'entrepreneur' && profile && (
          <div className="mb-4">
            <h4 className="font-medium text-slate-900 mb-2">{profile.companyName}</h4>
            <p className="text-sm text-slate-600 mb-3 line-clamp-3">
              {profile.companyDescription}
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.industry && (
                <Badge variant="secondary">{profile.industry}</Badge>
              )}
              {profile.fundingStage && (
                <Badge variant="outline">{profile.fundingStage}</Badge>
              )}
            </div>
          </div>
        )}
        
        {user.role === 'investor' && profile && (
          <div className="mb-4">
            <p className="text-sm text-slate-600 mb-3 line-clamp-3">
              {profile.bio}
            </p>
            <div className="flex flex-wrap gap-2">
              {profile.investmentInterests?.slice(0, 2).map((interest, index) => (
                <Badge key={index} variant="secondary">{interest}</Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex space-x-2">
          <Link href={`/profile/${user.id}`}>
            <Button className="flex-1">View Profile</Button>
          </Link>
          {onMessage && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onMessage(user.id)}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
