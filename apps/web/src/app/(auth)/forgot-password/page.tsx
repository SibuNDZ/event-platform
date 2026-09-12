import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            Password reset email is not available in this release. Sign in if you still have access,
            or create a new workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3">
          <Link href="/login">
            <Button>Back to login</Button>
          </Link>
          <Link href="/register">
            <Button variant="outline">Create account</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
