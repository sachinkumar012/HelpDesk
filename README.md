# HelpDesk Mini - MERN Stack Ticketing System

A comprehensive helpdesk ticketing system built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring SLA management, threaded comments, and role-based access control.

## 🚀 Features

### Core Features
- **Ticket Management**: Create, view, update, and track support tickets
- **SLA Management**: Automatic SLA deadline calculation and breach detection
- **Threaded Comments**: Nested comment system for ticket discussions
- **Role-Based Access**: User, Agent, and Admin roles with different permissions
- **Real-time Updates**: Socket.io integration for live notifications
- **Search & Filtering**: Advanced search and filtering capabilities
- **Responsive Design**: Modern UI with Tailwind CSS

### User Roles
- **User**: Create tickets, comment on own tickets, view only own tickets
- **Agent**: View & update assigned tickets, comment on tickets
- **Admin**: Full access - manage tickets, users, SLA, assignments

### SLA Features
- Automatic deadline calculation based on priority
- Visual SLA countdown with color-coded status
- Automatic breach detection via cron jobs
- Real-time breach notifications

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Socket.io** - Real-time communication
- **Node-cron** - Scheduled tasks for SLA checks

### Frontend
- **React** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Headless UI** - Accessible UI components
- **Heroicons** - Icon library
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Date-fns** - Date utilities

## 📁 Project Structure

```
helpdesk-mini/
├── server/                 # Backend
│   ├── config/            # Database configuration
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Custom middleware
│   └── index.js           # Server entry point
├── client/                # Frontend
│   ├── public/            # Static files
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/         # Page components
│       ├── context/       # React contexts
│       ├── api/           # API service layer
│       ├── utils/         # Utility functions
│       └── App.js         # App entry point
├── package.json           # Root dependencies
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd helpdesk-mini
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm run install-all
   
   # Or install manually
   npm install
   cd client && npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your configuration
   ```

4. **Environment Variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb://localhost:27017/helpdesk
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Client URL for CORS
   CLIENT_URL=http://localhost:3000
   ```

5. **Start the application**
   ```bash
   # Development mode (both server and client)
   npm run dev
   
   # Or start separately
   npm run server  # Backend only
   npm run client  # Frontend only
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `POST /api/auth/setup` - Setup admin user

### Tickets
- `GET /api/tickets` - Get tickets (with filtering)
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create new ticket
- `PATCH /api/tickets/:id` - Update ticket
- `GET /api/tickets/stats` - Get ticket statistics

### Comments
- `GET /api/tickets/:id/comments` - Get ticket comments
- `POST /api/tickets/:id/comments` - Add comment
- `PATCH /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🧪 Test Credentials

The system comes with pre-configured test users:

| Role  | Email              | Password  |
|-------|-------------------|-----------|
| Admin | admin@test.com    | admin123  |
| Agent | agent@test.com    | agent123  |
| User  | user@test.com     | user123   |

## 🎯 SLA Configuration

SLA deadlines are automatically calculated based on priority:
- **High Priority**: 6 hours
- **Medium Priority**: 24 hours  
- **Low Priority**: 48 hours

## 📊 Database Collections

### Users
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: ["user", "agent", "admin"]
}
```

### Tickets
```javascript
{
  title: String,
  description: String,
  status: ["open", "in_progress", "resolved", "closed"],
  priority: ["low", "medium", "high"],
  createdBy: ObjectId,
  assignedTo: ObjectId,
  slaDeadline: Date,
  breached: Boolean,
  version: Number
}
```

### Comments
```javascript
{
  ticketId: ObjectId,
  authorId: ObjectId,
  parentCommentId: ObjectId,
  content: String
}
```

### Timeline
```javascript
{
  ticketId: ObjectId,
  action: String,
  actorId: ObjectId,
  details: Object,
  timestamp: Date
}
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Rate limiting
- Input validation and sanitization
- CORS protection
- Helmet.js security headers

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Deploy to Heroku, Railway, or similar platform
3. Configure MongoDB Atlas for production database

### Frontend Deployment
1. Build the React app: `npm run build`
2. Deploy to Vercel, Netlify, or similar platform
3. Update API base URL for production

## 🧩 Key Features Explained

### SLA Management
- Automatic calculation based on ticket priority
- Background job checks for breaches every hour
- Real-time countdown display
- Visual indicators for urgent tickets

### Role-Based Access
- Users: Can only see their own tickets
- Agents: Can see assigned tickets
- Admins: Full system access

### Optimistic Locking
- Version field prevents concurrent update conflicts
- Returns 409 Conflict if version mismatch

### Real-time Updates
- Socket.io for live comment updates
- SLA breach notifications
- Ticket status changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- None currently reported

## 📞 Support

For support, please create an issue in the repository or contact the development team.

---

Built with ❤️ using the MERN stack