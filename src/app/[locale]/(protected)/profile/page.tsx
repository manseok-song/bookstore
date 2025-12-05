'use client';

import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { User, Mail, Calendar, BookOpen } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const t = useTranslations('profile');

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  const user = session.user;
  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0].toUpperCase() || 'U';

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.image || undefined} alt={user.name || 'User'} />
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl">{user.name || 'User'}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <User className="h-5 w-5" />
              <span>{user.name || 'Not set'}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Mail className="h-5 w-5" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Calendar className="h-5 w-5" />
              <span>Member since 2024</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="pt-4 border-t space-y-3">
            <Link href="/library">
              <Button variant="outline" className="w-full justify-start">
                <BookOpen className="h-4 w-4 mr-2" />
                My Library
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
