
export const dynamic = 'force-dynamic';
import PlaceholderPage from '@/components/layout/PlaceholderPage';
import { Car } from 'lucide-react';

export default function VehiclesPage() {
  return (
    <PlaceholderPage
      title="Véhicules de Service"
      description="Gestion de la flotte de véhicules"
      icon={Car}
      color="blue"
    />
  );
}
