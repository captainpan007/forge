import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-forge-bg p-6">
      <SignUp
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
