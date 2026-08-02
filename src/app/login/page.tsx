import Link from 'next/link'
import { login } from '@/app/auth/actions'
import { SubmitButton } from '@/components/SubmitButton'
import { Wallet } from 'lucide-react'

export default async function LoginPage(props: { searchParams: Promise<{ message: string }> }) {
  const searchParams = await props.searchParams
  return (
    <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8 relative min-h-screen overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center text-primary mb-6 animate-fade-in">
          <Wallet className="w-12 h-12" />
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-foreground animate-fade-in" style={{ animationDelay: '0.1s' }}>
          Welcome back
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[400px] relative z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="glass px-6 py-10 shadow sm:rounded-2xl sm:px-10 border border-white/20">
          <form className="space-y-6" action={login}>
            <div>
              <label className="block text-sm font-medium leading-6 text-foreground" htmlFor="email">
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-muted placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white/50 backdrop-blur-sm px-3 outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium leading-6 text-foreground" htmlFor="password">
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-muted placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 bg-white/50 backdrop-blur-sm px-3 outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {searchParams?.message && (
              <p className="mt-4 p-4 bg-destructive/10 text-destructive text-center text-sm rounded-md">
                {searchParams.message}
              </p>
            )}

            <div>
              <SubmitButton
                type="submit"
                pendingText="Signing in..."
                className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all hover-bounce"
              >
                Sign in
              </SubmitButton>
            </div>
          </form>

          <p className="mt-10 text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/signup" className="font-semibold leading-6 text-primary hover:text-indigo-500 transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
