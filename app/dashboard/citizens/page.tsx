
export const dynamic = 'force-dynamic';
import PlaceholderPage from '@/components/layout/PlaceholderPage';
import { UserCheck } from 'lucide-react';

export default function CitizensPage() {
  return (
    <PlaceholderPage
      title="Citoyens"
      description="Base de données des citoyens"
      icon={UserCheck}
      color="green"
    />
  );
}
