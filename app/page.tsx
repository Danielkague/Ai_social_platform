"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Shield, MessageCircle, Users, ArrowRight, Sparkles } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function LandingPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const { login, register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      if (isLogin) {
        const result = await login({ email, password })
        if (result.success) {
          setSuccess("Login successful! Redirecting...")
          setTimeout(() => router.push("/feed"), 1000)
        } else {
          setError(result.error || "Login failed")
        }
      } else {
        const result = await register({ email, password, full_name: fullName, username })
        if (result.success) {
          setSuccess("Registration successful! Please log in.")
          setIsLogin(true)
          setEmail("")
          setPassword("")
          setFullName("")
          setUsername("")
        } else {
          setError(result.error || "Registration failed")
        }
      }
    } catch (err: any) {
      setError(err.message || "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-800">Hope Social Media</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>AI-Powered Safety</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Welcome Message */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <span className="text-sm font-medium text-blue-600">Welcome to the Future of Social Media</span>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Welcome to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Hope Social Media
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                A safe, inclusive social platform where AI protects your well-being and fosters meaningful connections.
              </p>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg border border-gray-200">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">AI Content Moderation</h3>
                  <p className="text-sm text-gray-600">Advanced hate speech detection</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg border border-gray-200">
                <Heart className="w-5 h-5 text-red-500" />
                <div>
                  <h3 className="font-semibold text-gray-800">Mental Health Support</h3>
                  <p className="text-sm text-gray-600">24/7 AI counseling available</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg border border-gray-200">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Safe Conversations</h3>
                  <p className="text-sm text-gray-600">Real-time abuse prevention</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg border border-gray-200">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Inclusive Community</h3>
                  <p className="text-sm text-gray-600">Everyone belongs here</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login/Signup Form */}
          <div className="flex justify-center">
            <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-800">
                  {isLogin ? "Welcome Back" : "Join Our Community"}
                </CardTitle>
                <p className="text-gray-600">
                  {isLogin ? "Sign in to continue your journey" : "Create your account and start connecting safely"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Enter your full name"
                          required={!isLogin}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Choose a username"
                          required={!isLogin}
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                    />
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" text="" />
                    ) : (
                      <>
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin)
                      setError("")
                      setSuccess("")
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p className="text-sm">
          © 2024 Hope Social Media. Built with ❤️ for a safer internet.
        </p>
      </footer>
    </div>
  )
}
