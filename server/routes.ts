import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertProfileSchema, insertCollaborationRequestSchema, insertMessageSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import session from "express-session";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword
      });

      // Create empty profile
      await storage.createProfile({
        userId: user.id,
        bio: null,
        location: null,
        website: null,
        linkedin: null,
        phone: null,
        investmentInterests: null,
        portfolioCompanies: null,
        investmentRange: null,
        companyName: null,
        companyDescription: null,
        industry: null,
        fundingStage: null,
        fundingGoal: null,
        pitchDeckUrl: null,
        teamMembers: null
      });

      req.session.userId = user.id;
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const userWithProfile = await storage.getUserWithProfile(req.session.userId);
      if (!userWithProfile) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = userWithProfile;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // User routes
  app.get("/api/users", requireAuth, async (req: any, res) => {
    try {
      const { role } = req.query;
      const users = await storage.getUsersWithProfiles(role as string);
      
      // Remove passwords and current user
      const filteredUsers = users
        .filter(user => user.id !== req.session.userId)
        .map(({ password, ...user }) => user);
      
      res.json(filteredUsers);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const user = await storage.getUserWithProfile(parseInt(id));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Profile routes
  app.put("/api/profile", requireAuth, async (req: any, res) => {
    try {
      const profileData = req.body;
      const updatedProfile = await storage.updateProfile(req.session.userId, profileData);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Collaboration request routes
  app.get("/api/collaboration-requests", requireAuth, async (req: any, res) => {
    try {
      const requests = await storage.getCollaborationRequests(req.session.userId);
      
      // Populate with user data
      const populatedRequests = await Promise.all(
        requests.map(async (request) => {
          const fromUser = await storage.getUserWithProfile(request.fromUserId);
          return {
            ...request,
            fromUser: fromUser ? { ...fromUser, password: undefined } : null
          };
        })
      );
      
      res.json(populatedRequests);
    } catch (error) {
      console.error("Get collaboration requests error:", error);
      res.status(500).json({ message: "Failed to get collaboration requests" });
    }
  });

  app.post("/api/collaboration-requests", requireAuth, async (req: any, res) => {
    try {
      const requestData = insertCollaborationRequestSchema.parse({
        ...req.body,
        fromUserId: req.session.userId
      });
      
      const request = await storage.createCollaborationRequest(requestData);
      res.json(request);
    } catch (error) {
      console.error("Create collaboration request error:", error);
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  app.put("/api/collaboration-requests/:id", requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const updatedRequest = await storage.updateCollaborationRequest(parseInt(id), status);
      res.json(updatedRequest);
    } catch (error) {
      console.error("Update collaboration request error:", error);
      res.status(500).json({ message: "Failed to update collaboration request" });
    }
  });

  // Message routes
  app.get("/api/messages/:userId", requireAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getMessages(req.session.userId, parseInt(userId));
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Failed to get messages" });
    }
  });

  app.post("/api/messages", requireAuth, async (req: any, res) => {
    try {
      const messageData = insertMessageSchema.parse({
        ...req.body,
        fromUserId: req.session.userId
      });
      
      const message = await storage.createMessage(messageData);
      
      // Broadcast to WebSocket clients
      const messageToSend = {
        type: 'message',
        data: message
      };
      
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(messageToSend));
        }
      });
      
      res.json(message);
    } catch (error) {
      console.error("Create message error:", error);
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('Received message:', message);
        
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  return httpServer;
}
