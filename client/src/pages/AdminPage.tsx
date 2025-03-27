import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { apiRequest } from '@/lib/queryClient';

export default function AdminPage() {
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [migrationMessage, setMigrationMessage] = useState('');

  const runDatabaseMigration = async () => {
    try {
      setMigrationStatus('running');
      setMigrationMessage('Starting database migration...');

      const response = await apiRequest(
        'POST',
        '/api/admin/run-migration',
        {}
      );
      
      // If we get here, the request was successful since apiRequest throws on error
      const data = await response.json();
      setMigrationStatus('success');
      setMigrationMessage(data.message || 'Migration completed successfully');
    } catch (error) {
      setMigrationStatus('error');
      setMigrationMessage('An unexpected error occurred during migration');
      console.error('Migration error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Dashboard</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Database Management</CardTitle>
            <Badge variant={
              migrationStatus === 'idle' ? 'outline' :
              migrationStatus === 'running' ? 'secondary' :
              migrationStatus === 'success' ? 'success' :
              'destructive'
            }>
              {migrationStatus === 'idle' ? 'Ready' :
               migrationStatus === 'running' ? 'Running' :
               migrationStatus === 'success' ? 'Success' :
               'Error'}
            </Badge>
          </div>
          <CardDescription>
            Manage database migrations and maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          {migrationMessage && (
            <Alert className="mb-4" variant={migrationStatus === 'error' ? 'destructive' : undefined}>
              <AlertTitle>{migrationStatus === 'error' ? 'Error' : 'Status'}</AlertTitle>
              <AlertDescription>{migrationMessage}</AlertDescription>
            </Alert>
          )}
          
          <p className="text-sm text-muted-foreground mb-4">
            Database migrations allow you to update your database schema while preserving existing data.
            Only run migrations when necessary and make sure to back up your data first.
          </p>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Run Schema Migration</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Push your latest schema changes to the database. This action is safe for adding new tables
                but may result in data loss if modifying existing structures.
              </p>
              <Button 
                onClick={runDatabaseMigration}
                disabled={migrationStatus === 'running'}
                variant="default"
                className="mt-2"
              >
                {migrationStatus === 'running' ? 'Running Migration...' : 'Run Migration'}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground">
          Note: Database operations can affect all users. Use with caution.
        </CardFooter>
      </Card>
    </div>
  );
}