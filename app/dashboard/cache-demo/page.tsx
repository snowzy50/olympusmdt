
export const dynamic = 'force-dynamic';
import PlaceholderPage from '@/components/layout/PlaceholderPage';
import { Database } from 'lucide-react';

export default function CacheDemoPage() {
  return (
    <PlaceholderPage
      title="Cache Demo"
      description="Démonstration du système de cache"
      icon={Database}
      color="purple"
    />
  );
}
