# SubSentry - Subscription Management Application

A comprehensive subscription tracking and management application built with React, Vite, and modern web technologies.

## 🚀 Features

### Core Functionality
- **Subscription Management**: Add, edit, delete, and track all your subscriptions
- **Calendar Interface**: Visual calendar view with color-coded subscription statuses
- **Analytics Dashboard**: Comprehensive spending analysis with charts and insights
- **Report Generation**: Create detailed reports in multiple formats (PDF, Excel, CSV)
- **Smart Notifications**: Email and browser notifications for renewals and important updates

### User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Theme**: Toggle between themes for comfortable viewing
- **Real-time Updates**: Live data synchronization and instant updates
- **Intuitive Navigation**: Clean, modern interface with easy-to-use controls

### Advanced Features
- **AI Insights**: Personalized recommendations and spending optimization tips
- **Bulk Operations**: Manage multiple subscriptions at once
- **Data Export/Import**: Backup and restore your subscription data
- **Custom Categories**: Organize subscriptions with custom categories
- **Scheduled Reports**: Automated report generation and delivery

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Lightning-fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **React Router** - Client-side routing for single-page application
- **React Query** - Powerful data synchronization for React
- **React Hook Form** - Performant, flexible forms with easy validation
- **Recharts** - Composable charting library built on React and D3
- **Lucide React** - Beautiful, customizable SVG icons
- **React Hot Toast** - Elegant notifications for React

### Backend (Planned)
- **Spring Boot** - Java-based framework for building web applications
- **MongoDB** - NoSQL database for flexible data storage
- **JWT** - JSON Web Tokens for secure authentication
- **Spring Security** - Comprehensive security framework
- **Spring Data MongoDB** - Data access layer for MongoDB
- **Email Service** - SMTP integration for notifications

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── common/         # Common/shared components
│   ├── dashboard/      # Dashboard-specific components
│   ├── analysis/       # Analytics components
│   ├── reports/        # Report generation components
│   ├── subscription/   # Subscription management components
│   ├── notification/   # Notification components
│   └── layout/         # Layout components (header, sidebar, etc.)
├── contexts/           # React Context providers
├── pages/              # Page components
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # Global styles and themes
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser
- (Optional) MongoDB for backend development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd subsentry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Environment Configuration

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:8080/api

# Application Configuration
VITE_APP_NAME=SubSentry
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REPORTS=true
```

## 📱 Usage

### Getting Started
1. **Sign Up**: Create a new account with your email and password
2. **Complete Onboarding**: Set your preferences and goals
3. **Add Subscriptions**: Start by adding your first subscription
4. **Explore Features**: Use the calendar, analysis, and reports features

### Key Features

#### Subscription Management
- Add subscriptions with details like amount, billing cycle, and category
- Set renewal dates and auto-renewal preferences
- Organize subscriptions with custom categories
- Bulk edit and delete operations

#### Calendar View
- Visual calendar showing subscription renewals
- Color-coded indicators for different subscription types
- Click to add new subscriptions or view existing ones
- Filter by category or search by name

#### Analytics Dashboard
- Spending trends over time
- Category breakdown with interactive charts
- Top subscriptions by cost
- AI-generated insights and recommendations

#### Report Generation
- Multiple report templates (summary, detailed, category, etc.)
- Custom date ranges and filters
- Export in PDF, Excel, CSV, or JSON formats
- Scheduled report generation

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Structure

The application follows a modular architecture with clear separation of concerns:

- **Components**: Reusable UI components with props-based configuration
- **Contexts**: Global state management using React Context
- **Services**: API integration layer with error handling
- **Hooks**: Custom hooks for reusable logic
- **Pages**: Route-based page components

### Styling

The application uses Tailwind CSS for styling with a custom design system:

- **Colors**: Blue primary theme with semantic color usage
- **Typography**: Inter font family with consistent sizing
- **Spacing**: Consistent spacing scale using Tailwind utilities
- **Components**: Custom component classes for complex UI elements

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Environment Variables

Set the following environment variables for production:

- `VITE_API_URL` - Backend API URL
- `VITE_APP_NAME` - Application name
- `VITE_ENABLE_NOTIFICATIONS` - Enable/disable notifications
- `VITE_ENABLE_ANALYTICS` - Enable/disable analytics
- `VITE_ENABLE_REPORTS` - Enable/disable reports

## 🔒 Security

### Authentication
- JWT-based authentication with secure token storage
- Password hashing and validation
- Session management with automatic logout
- Password reset functionality

### Data Protection
- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure API communication

## 📊 Performance

### Optimization Features
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies
- Progressive Web App features

### Monitoring
- Error tracking and logging
- Performance monitoring
- User analytics
- Real-time error reporting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the fast build tool
- Tailwind CSS for the utility-first CSS framework
- All the open-source contributors who made this project possible

## 📞 Support

For support, email support@subsentry.com or join our Slack channel.

---

**SubSentry** - Take control of your subscription spending! 💰



## Database Setup with Railway

1. Get the database credentials from the team lead
2. Create a `.env` file in the project root
3. Add the following environment variables with Railway credentials:
   ```
   MYSQL_HOST=your-railway-host
   MYSQL_PORT=your-railway-port
   MYSQL_DATABASE=railway
   MYSQL_USER=your-railway-username
   MYSQL_PASSWORD=your-railway-password
   ```
4. The application will automatically connect to the Railway database

Note: Never commit the `.env` file to Git