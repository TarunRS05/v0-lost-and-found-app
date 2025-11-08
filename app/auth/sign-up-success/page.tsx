import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Navigation from "@/components/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignUpSuccessPage() {
  return (
    <>
      <Navigation user={null} />
      <div className="flex min-h-screen w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card className="shadow-lg border-green-100">
            <CardHeader>
              <CardTitle className="text-2xl text-green-600">Welcome to FindIt!</CardTitle>
              <CardDescription>Check your email to confirm your account</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-6">
                We've sent a confirmation email to your inbox. Click the link in the email to verify your account and
                start using FindIt.
              </p>
              <Link href="/">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
