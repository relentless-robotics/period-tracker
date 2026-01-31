# Period Tracker

A modern, secure period tracking app with user authentication.

## Features

- **Secure Authentication** - Sign in with Google, email, or other OAuth providers via Clerk
- **Cycle Tracking** - Log your periods and track your menstrual cycle
- **Ovulation Prediction** - Automatically calculate and display fertile windows
- **Personalized Statistics** - View cycle length, period duration, and more
- **Smart Notifications** - Get reminders before your next period
- **Privacy-Focused** - Your data is stored locally in your browser and tied to your account

## Tech Stack

- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Clerk** - User authentication and management
- **date-fns** - Date manipulation library

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Clerk account (free tier available)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/relentless-robotics/period-tracker.git
   cd period-tracker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Clerk authentication:
   - Sign up at [https://clerk.com](https://clerk.com)
   - Create a new application
   - Copy your API keys

4. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add your Clerk environment variables:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Deploy!

### Other Platforms

This is a standard Next.js app and can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render

## Usage

1. **Sign Up/Sign In** - Create an account or sign in with Google
2. **Log a Period** - Click "Log Period" and enter your period dates
3. **Track Your Cycle** - View your calendar with highlighted period days, fertile windows, and ovulation predictions
4. **Customize Settings** - Adjust reminder settings and notification preferences

## Security & Privacy

- All authentication is handled securely by Clerk
- User data is stored locally in the browser and isolated per user
- No period data is sent to any server
- HTTPS enforced in production

## License

MIT License - feel free to use this project for your own purposes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues or questions, please open an issue on GitHub.
