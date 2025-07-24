import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type LoginData, type RegisterData } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
    queryFn: () => 
      fetch("/api/auth/me", { credentials: "include" })
        .then(res => {
          if (!res.ok) throw new Error("Not authenticated");
          return res.json();
        }),
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/me"], user);
      toast({
        title: "Welcome to Business Nexus!",
        description: "Your account has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.invalidateQueries();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
  });
}
