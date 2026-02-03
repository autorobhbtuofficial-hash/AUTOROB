# AUTOROB - HBTU Robotics & Automation Club Website

Official website for AUTOROB, HBTU's premier robotics and automation club.

## 🚀 Features

- **Modern UI/UX** - Glassmorphism design with 3D rotating starfield background
- **Authentication** - Firebase Auth with Email/Password and Google Sign-in
- **Dynamic Pages**:
  - Home with hero section and stats
  - About with mission, vision, and timeline
  - Team with member profiles and social links
  - Events with filtering and registration
  - Library with resources (PDFs, Videos, GitHub)
  - Gallery with lightbox and categories
  - Contact with form submission
  - Dashboard with user profile and tabs

- **Dashboard Features**:
  - Profile with avatar and stats
  - Events management
  - Activities timeline
  - Latest news
  - Certificates
  - Settings

- **UI Enhancements**:
  - Retractable social sidebar (bottom-right)
  - Responsive navbar with auth-based links
  - Smooth animations with Framer Motion
  - 3D rotating starfield background

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Styling**: CSS with custom properties
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Icons**: React Icons + Font Awesome

## 📦 Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 🌐 Deployment

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard

The `netlify.toml` file is already configured for SPA routing.

## 📁 Project Structure

```
autorob-website/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable components
│   │   └── home/            # Home page components
│   ├── contexts/            # React contexts (Auth)
│   ├── pages/               # Page components
│   ├── services/            # Firebase config
│   └── styles/              # Global styles
├── public/                  # Static assets
└── index.html              # Entry HTML
```

## 🎨 Key Features

### Authentication
- Email/Password registration and login
- Google Sign-in
- Protected routes
- User roles (admin, subadmin, user)

### Dashboard
- Clean left sidebar navigation
- Profile tab with avatar and stats
- Events, Activities, News tabs
- Certificates management
- Settings panel

### UI/UX
- 3D rotating starfield background
- Retractable social media sidebar
- Glassmorphism design
- Smooth page transitions
- Responsive design

## 👥 Contributing

This is the official AUTOROB HBTU website. For contributions, please contact the team.

## 📄 License

© 2024 AUTOROB - HBTU. All rights reserved.
