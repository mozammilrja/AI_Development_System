import { useState } from 'react';
import { AppLayout } from '../components/layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Avatar,
} from '../components/ui';
import { useAuthStore } from '../stores';
import { useUpdateProfile, useLogout } from '../hooks';
import { cn } from '../lib/utils';

const tabs = [
  { id: 'profile', name: 'Profile' },
  { id: 'security', name: 'Security' },
  { id: 'notifications', name: 'Notifications' },
];

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">
            Manage your account settings and preferences.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'py-4 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                )}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'profile' && <ProfileSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
      </div>
    </AppLayout>
  );
}

function ProfileSettings() {
  const user = useAuthStore((state) => state.user);
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(formData);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Avatar */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Avatar name={user?.name} src={user?.avatar} size="xl" />
          <Button variant="outline" size="sm" className="mt-4">
            Change Photo
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            JPG, PNG or GIF. Max 2MB.
          </p>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled
              helperText="Email cannot be changed"
            />
            <div className="pt-4">
              <Button type="submit" isLoading={updateProfile.isPending}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySettings() {
  const logout = useLogout();
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password change
    console.log('Change password');
  };

  return (
    <div className="space-y-6">
      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <Input
              label="Current Password"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
            />
            <Input
              label="New Password"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
            />
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>

      {/* Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <MonitorIcon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Current Session</p>
                  <p className="text-sm text-gray-500">Chrome on macOS</p>
                </div>
              </div>
              <span className="text-sm text-green-600">Active now</span>
            </div>
          </div>
          <Button
            variant="danger"
            className="mt-4"
            onClick={() => logout.mutate()}
          >
            Sign Out All Devices
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="danger">Delete Account</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    email: {
      marketing: true,
      security: true,
      updates: false,
    },
    push: {
      mentions: true,
      comments: true,
      reminders: false,
    },
  });

  const toggleNotification = (type: 'email' | 'push', key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: !prev[type][key as keyof typeof prev.email],
      },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle
            title="Marketing emails"
            description="Receive emails about new products and features"
            checked={notifications.email.marketing}
            onChange={() => toggleNotification('email', 'marketing')}
          />
          <NotificationToggle
            title="Security alerts"
            description="Get notified about security issues"
            checked={notifications.email.security}
            onChange={() => toggleNotification('email', 'security')}
          />
          <NotificationToggle
            title="Product updates"
            description="Receive updates about product changes"
            checked={notifications.email.updates}
            onChange={() => toggleNotification('email', 'updates')}
          />
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationToggle
            title="Mentions"
            description="Get notified when someone mentions you"
            checked={notifications.push.mentions}
            onChange={() => toggleNotification('push', 'mentions')}
          />
          <NotificationToggle
            title="Comments"
            description="Get notified about new comments"
            checked={notifications.push.comments}
            onChange={() => toggleNotification('push', 'comments')}
          />
          <NotificationToggle
            title="Reminders"
            description="Receive task reminders"
            checked={notifications.push.reminders}
            onChange={() => toggleNotification('push', 'reminders')}
          />
        </CardContent>
      </Card>

      <Button>Save Preferences</Button>
    </div>
  );
}

interface NotificationToggleProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function NotificationToggle({ title, description, checked, onChange }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={cn(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          checked ? 'bg-blue-600' : 'bg-gray-200'
        )}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  );
}

function MonitorIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
