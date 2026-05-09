import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-forge-bg p-6">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-forge-bg-elevated border border-forge-border shadow-none',
          },
        }}
      />
    </div>
  )
}
