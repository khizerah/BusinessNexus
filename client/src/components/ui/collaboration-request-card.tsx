import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Check, X } from "lucide-react";
import { CollaborationRequest } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CollaborationRequestCardProps {
  request: CollaborationRequest;
}

export function CollaborationRequestCard({ request }: CollaborationRequestCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateRequestMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/collaboration-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/collaboration-requests"] });
      toast({
        title: "Request updated",
        description: "The collaboration request has been updated.",
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

  const handleAccept = () => {
    updateRequestMutation.mutate({ id: request.id, status: "accepted" });
  };

  const handleDecline = () => {
    updateRequestMutation.mutate({ id: request.id, status: "declined" });
  };

  if (!request.fromUser) return null;

  const { fromUser } = request;

  return (
    <Card className={`hover:shadow-md transition-shadow ${
      request.status === 'accepted' ? 'bg-slate-50' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-12 w-12">
              <AvatarImage src={fromUser.profileImageUrl} alt={`${fromUser.firstName} ${fromUser.lastName}`} />
              <AvatarFallback>
                {fromUser.firstName[0]}{fromUser.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <h3 className="font-semibold text-slate-900">
                {fromUser.firstName} {fromUser.lastName}
              </h3>
              <p className="text-sm text-slate-600">
                {fromUser.profile?.investmentRange || 'Investor'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {request.status === 'accepted' ? (
                  <span className="text-emerald-600 font-medium">Accepted</span>
                ) : (
                  <>Interested in collaboration • {formatDistanceToNow(new Date(request.createdAt))} ago</>
                )}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {request.status === 'pending' ? (
              <>
                <Button
                  size="sm"
                  onClick={handleAccept}
                  disabled={updateRequestMutation.isPending}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  disabled={updateRequestMutation.isPending}
                >
                  <X className="h-4 w-4 mr-1" />
                  Decline
                </Button>
              </>
            ) : request.status === 'accepted' ? (
              <Button size="sm">
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
            ) : null}
          </div>
        </div>
        {request.message && (
          <div className="mt-3 ml-16">
            <p className="text-slate-600 text-sm">"{request.message}"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
