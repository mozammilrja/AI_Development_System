import { AppLayout } from '../components/layout';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '../components/ui';
import { useSubscription } from '../hooks';
import { useAuthStore } from '../stores';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data: subscription } = useSubscription();

  const stats = [
    { name: 'Total Projects', value: '12', change: '+2 from last month' },
    { name: 'Team Members', value: '8', change: '+1 this week' },
    { name: 'API Calls', value: '24,532', change: '85% of limit' },
    { name: 'Storage Used', value: '4.2 GB', change: '42% of limit' },
  ];

  const recentActivity = [
    { id: 1, action: 'Project created', project: 'Marketing Site', time: '2 hours ago' },
    { id: 2, action: 'Team member added', project: 'API Server', time: '4 hours ago' },
    { id: 3, action: 'Deployment completed', project: 'Mobile App', time: '6 hours ago' },
    { id: 4, action: 'Settings updated', project: 'Dashboard', time: '1 day ago' },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>

        {/* Subscription Banner */}
        {subscription?.plan === 'free' && (
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Upgrade to Pro</h3>
                <p className="text-blue-100 mt-1">
                  Get unlimited projects, priority support, and more.
                </p>
              </div>
              <a
                href="/billing"
                className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                View Plans
              </a>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-6">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200">
                {recentActivity.map((activity) => (
                  <li key={activity.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                        <p className="text-sm text-gray-500">{activity.project}</p>
                      </div>
                      <span className="text-sm text-gray-400">{activity.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <PlusIcon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">New Project</p>
                  <p className="text-sm text-gray-500">Start a new project</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Invite Team</p>
                  <p className="text-sm text-gray-500">Add team members</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <DocumentIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Docs</p>
                  <p className="text-sm text-gray-500">API documentation</p>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
