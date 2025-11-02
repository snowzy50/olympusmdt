
export const dynamic = 'force-dynamic';
import PlaceholderPage from '@/components/layout/PlaceholderPage';
import { FolderOpen } from 'lucide-react';

export default function ActiveCasesPage() {
  return (
    <PlaceholderPage
      title="Mes Dossiers en Cours"
      description="Gestion de vos dossiers actifs avec upload de fichiers"
      icon={FolderOpen}
      color="blue"
    />
  );
}
