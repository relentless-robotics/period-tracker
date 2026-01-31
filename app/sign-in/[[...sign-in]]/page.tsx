import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Period Tracker</h1>
          <p className="text-gray-600">Sign in to access your personal cycle data</p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary: 'bg-pink-500 hover:bg-pink-600 text-sm normal-case',
              card: 'shadow-2xl',
              headerTitle: 'text-gray-800',
              headerSubtitle: 'text-gray-600',
            },
          }}
        />
      </div>
    </div>
  );
}
