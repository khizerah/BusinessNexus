import { 
  users, 
  profiles,
  collaborationRequests,
  messages,
  type User, 
  type InsertUser,
  type Profile,
  type InsertProfile,
  type CollaborationRequest,
  type InsertCollaborationRequest,
  type Message,
  type InsertMessage,
  type UserWithProfile
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile operations
  getProfile(userId: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(userId: number, profile: Partial<InsertProfile>): Promise<Profile>;
  
  // User with profile operations
  getUserWithProfile(id: number): Promise<UserWithProfile | undefined>;
  getUsersWithProfiles(role?: string): Promise<UserWithProfile[]>;
  
  // Collaboration request operations
  getCollaborationRequests(userId: number): Promise<CollaborationRequest[]>;
  createCollaborationRequest(request: InsertCollaborationRequest): Promise<CollaborationRequest>;
  updateCollaborationRequest(id: number, status: string): Promise<CollaborationRequest>;
  
  // Message operations
  getMessages(userId1: number, userId2: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profiles: Map<number, Profile>;
  private collaborationRequests: Map<number, CollaborationRequest>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentProfileId: number;
  private currentRequestId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.profiles = new Map();
    this.collaborationRequests = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentProfileId = 1;
    this.currentRequestId = 1;
    this.currentMessageId = 1;
    
    // Seed with sample data
    this.seedData();
  }

  private async seedData() {
    // Create sample users
    const investor = await this.createUser({
      email: "alex.thompson@vcpartners.com",
      password: "password123",
      firstName: "Alex",
      lastName: "Thompson",
      role: "investor",
      profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    });

    const entrepreneur1 = await this.createUser({
      email: "sarah.chen@greentech.com",
      password: "password123",
      firstName: "Sarah",
      lastName: "Chen",
      role: "entrepreneur",
      profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    });

    const entrepreneur2 = await this.createUser({
      email: "marcus.rodriguez@healthai.com",
      password: "password123",
      firstName: "Marcus",
      lastName: "Rodriguez",
      role: "entrepreneur",
      profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    });

    const entrepreneur3 = await this.createUser({
      email: "priya.patel@educonnect.com",
      password: "password123",
      firstName: "Priya",
      lastName: "Patel",
      role: "entrepreneur",
      profileImageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"
    });

    // Create profiles
    await this.createProfile({
      userId: investor.id,
      bio: "Experienced venture capitalist with 15+ years in tech investments. Focus on early-stage startups in AI, sustainability, and healthcare.",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/alexthompson",
      investmentInterests: ["AI/ML", "Sustainability", "Healthcare", "FinTech"],
      portfolioCompanies: ["TechCorp", "GreenEnergy Inc", "HealthTech Solutions"],
      investmentRange: "$500K - $5M"
    });

    await this.createProfile({
      userId: entrepreneur1.id,
      bio: "Passionate entrepreneur with 8+ years in sustainable technology. Leading GreenTech Solutions to revolutionize urban energy consumption.",
      location: "San Francisco, CA",
      linkedin: "linkedin.com/in/sarahchen",
      phone: "+1 (555) 123-4567",
      companyName: "GreenTech Solutions",
      companyDescription: "Revolutionary sustainable energy solutions for urban environments, focusing on next-generation solar panel technology and smart energy management systems.",
      industry: "Clean Energy",
      fundingStage: "Series A",
      fundingGoal: "$2M",
      teamMembers: [
        { name: "Mike Johnson", role: "CTO", image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" },
        { name: "Lisa Wang", role: "VP Operations", image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100" }
      ]
    });

    await this.createProfile({
      userId: entrepreneur2.id,
      bio: "AI researcher turned entrepreneur, building the future of healthcare diagnostics with cutting-edge machine learning technology.",
      location: "Boston, MA",
      linkedin: "linkedin.com/in/marcusrodriguez",
      companyName: "HealthAI",
      companyDescription: "AI-powered diagnostic platform revolutionizing early disease detection through advanced machine learning algorithms.",
      industry: "Healthcare",
      fundingStage: "Pre-Series A",
      fundingGoal: "$1.5M"
    });

    await this.createProfile({
      userId: entrepreneur3.id,
      bio: "EdTech innovator creating immersive learning experiences through virtual reality technology.",
      location: "Austin, TX",
      linkedin: "linkedin.com/in/priyapatel",
      companyName: "EduConnect",
      companyDescription: "Connecting students globally through virtual reality learning experiences and interactive educational content.",
      industry: "EdTech",
      fundingStage: "Seed",
      fundingGoal: "$800K"
    });

    // Create sample collaboration requests
    await this.createCollaborationRequest({
      fromUserId: investor.id,
      toUserId: entrepreneur1.id,
      message: "I'm impressed by GreenTech's sustainable approach and would like to discuss potential Series A investment opportunities.",
      status: "pending"
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(), 
      profileImageUrl: insertUser.profileImageUrl || null
    };
    this.users.set(id, user);
    return user;
  }

  async getProfile(userId: number): Promise<Profile | undefined> {
    return Array.from(this.profiles.values()).find(profile => profile.userId === userId);
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const id = this.currentProfileId++;
    const profile: Profile = { 
      ...insertProfile, 
      id, 
      updatedAt: new Date(),
      bio: insertProfile.bio || null,
      location: insertProfile.location || null,
      website: insertProfile.website || null,
      linkedin: insertProfile.linkedin || null,
      phone: insertProfile.phone || null,
      investmentInterests: insertProfile.investmentInterests || null,
      portfolioCompanies: insertProfile.portfolioCompanies || null,
      investmentRange: insertProfile.investmentRange || null,
      companyName: insertProfile.companyName || null,
      companyDescription: insertProfile.companyDescription || null,
      industry: insertProfile.industry || null,
      fundingStage: insertProfile.fundingStage || null,
      fundingGoal: insertProfile.fundingGoal || null,
      pitchDeckUrl: insertProfile.pitchDeckUrl || null,
      teamMembers: insertProfile.teamMembers || null
    };
    this.profiles.set(id, profile);
    return profile;
  }

  async updateProfile(userId: number, updateData: Partial<InsertProfile>): Promise<Profile> {
    const existingProfile = await this.getProfile(userId);
    if (!existingProfile) {
      throw new Error("Profile not found");
    }
    
    const updatedProfile: Profile = {
      ...existingProfile,
      ...updateData,
      updatedAt: new Date()
    };
    
    this.profiles.set(existingProfile.id, updatedProfile);
    return updatedProfile;
  }

  async getUserWithProfile(id: number): Promise<UserWithProfile | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const profile = await this.getProfile(id);
    return { ...user, profile: profile || null };
  }

  async getUsersWithProfiles(role?: string): Promise<UserWithProfile[]> {
    const users = Array.from(this.users.values());
    const filteredUsers = role ? users.filter(user => user.role === role) : users;
    
    const usersWithProfiles = await Promise.all(
      filteredUsers.map(async (user) => {
        const profile = await this.getProfile(user.id);
        return { ...user, profile: profile || null };
      })
    );
    
    return usersWithProfiles;
  }

  async getCollaborationRequests(userId: number): Promise<CollaborationRequest[]> {
    return Array.from(this.collaborationRequests.values())
      .filter(request => request.toUserId === userId);
  }

  async createCollaborationRequest(insertRequest: InsertCollaborationRequest): Promise<CollaborationRequest> {
    const id = this.currentRequestId++;
    const request: CollaborationRequest = { 
      ...insertRequest, 
      id, 
      createdAt: new Date(),
      status: insertRequest.status || "pending",
      message: insertRequest.message || null
    };
    this.collaborationRequests.set(id, request);
    return request;
  }

  async updateCollaborationRequest(id: number, status: string): Promise<CollaborationRequest> {
    const request = this.collaborationRequests.get(id);
    if (!request) {
      throw new Error("Collaboration request not found");
    }
    
    const updatedRequest: CollaborationRequest = { ...request, status };
    this.collaborationRequests.set(id, updatedRequest);
    return updatedRequest;
  }

  async getMessages(userId1: number, userId2: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => 
        (message.fromUserId === userId1 && message.toUserId === userId2) ||
        (message.fromUserId === userId2 && message.toUserId === userId1)
      )
      .sort((a, b) => a.createdAt!.getTime() - b.createdAt!.getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date() 
    };
    this.messages.set(id, message);
    return message;
  }
}

export const storage = new MemStorage();
