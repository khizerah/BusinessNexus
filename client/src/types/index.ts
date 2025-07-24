export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'investor' | 'entrepreneur';
  profileImageUrl?: string;
  createdAt: Date;
}

export interface Profile {
  id: number;
  userId: number;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  phone?: string;
  // Investor specific fields
  investmentInterests?: string[];
  portfolioCompanies?: string[];
  investmentRange?: string;
  // Entrepreneur specific fields
  companyName?: string;
  companyDescription?: string;
  industry?: string;
  fundingStage?: string;
  fundingGoal?: string;
  pitchDeckUrl?: string;
  teamMembers?: any[];
  updatedAt: Date;
}

export interface UserWithProfile extends User {
  profile: Profile | null;
}

export interface CollaborationRequest {
  id: number;
  fromUserId: number;
  toUserId: number;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  fromUser?: UserWithProfile;
}

export interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  content: string;
  createdAt: Date;
}
