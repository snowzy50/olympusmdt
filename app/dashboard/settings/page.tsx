
export const dynamic = 'force-dynamic';
import PlaceholderPage from '@/components/layout/PlaceholderPage';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <PlaceholderPage
      title="Paramètres"
      description="Configuration et préférences"
      icon={Settings}
      color="primary"
    />
  );
}
