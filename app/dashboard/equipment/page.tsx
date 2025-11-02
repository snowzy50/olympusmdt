
export const dynamic = 'force-dynamic';
import PlaceholderPage from '@/components/layout/PlaceholderPage';
import { Briefcase } from 'lucide-react';

export default function EquipmentPage() {
  return (
    <PlaceholderPage
      title="Équipements"
      description="Gestion des équipements et inventaire"
      icon={Briefcase}
      color="purple"
    />
  );
}
