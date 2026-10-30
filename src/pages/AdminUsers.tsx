import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Check, X, Users, Shield, Loader2, ArrowLeft, Monitor } from 'lucide-react';
import { UserSessionsPanel } from '@/components/admin/UserSessionsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDemoMode } from '@/hooks/useDemoMode';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  is_approved: boolean;
  created_at: string;
  current_level: string | null;
}

export default function AdminUsers() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDemoUser } = useDemoMode();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!isDemoUser) {
      checkAdminAndFetchUsers();
    }
  }, [user, isDemoUser]);

  if (isDemoUser) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardContent className="p-8 text-center">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground">The admin panel is not available in demo mode to protect user privacy.</p>
              <Button className="mt-4" onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const checkAdminAndFetchUsers = async () => {
    if (!user) return;

    try {
      // Check if current user is admin
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roleData) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setIsAdmin(true);

      // Fetch all user profiles
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(profilesData || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (userId: string, approve: boolean) => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_approved: approve })
        .eq('user_id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.user_id === userId ? { ...u, is_approved: approve } : u
      ));

      toast({
        title: approve ? 'User Approved' : 'User Rejected',
        description: approve 
          ? 'The user can now access the platform' 
          : 'The user has been rejected',
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="container py-8 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="container py-8">
          <Card className="max-w-md mx-auto text-center">
            <CardContent className="pt-8 pb-6">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access this page.
              </p>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const pendingUsers = users.filter(u => !u.is_approved);
  const approvedUsers = users.filter(u => u.is_approved);

  return (
    <AppLayout>
      <div className="container py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-2xl flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Manage users and active sessions</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="sessions" className="gap-2">
              <Monitor className="w-4 h-4" />
              Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    {pendingUsers.length}
                  </Badge>
                  Pending Approvals
                </CardTitle>
                <CardDescription>
                  Users waiting for your approval to access the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No pending approvals
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pendingUsers.map((profile) => (
                      <div 
                        key={profile.id} 
                        className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-secondary/30 transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {profile.display_name || 'No name'}
                          </p>
                          {profile.email && (
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Registered: {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleApproval(profile.user_id, false)}
                            disabled={actionLoading === profile.user_id}
                          >
                            {actionLoading === profile.user_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApproval(profile.user_id, true)}
                            disabled={actionLoading === profile.user_id}
                          >
                            {actionLoading === profile.user_id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Approved Users */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    {approvedUsers.length}
                  </Badge>
                  Approved Users
                </CardTitle>
                <CardDescription>
                  Users with access to the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {approvedUsers.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No approved users yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {approvedUsers.map((profile) => (
                      <div 
                        key={profile.id} 
                        className="flex items-center justify-between p-4 rounded-lg border bg-card"
                      >
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {profile.display_name || 'No name'}
                            {profile.current_level && (
                              <Badge variant="outline" className="text-xs">
                                {profile.current_level}
                              </Badge>
                            )}
                          </p>
                          {profile.email && (
                            <p className="text-sm text-muted-foreground">{profile.email}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Approved • Registered {new Date(profile.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleApproval(profile.user_id, false)}
                          disabled={actionLoading === profile.user_id}
                        >
                          {actionLoading === profile.user_id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Revoke'
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <UserSessionsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
