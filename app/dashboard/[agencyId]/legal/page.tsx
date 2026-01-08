/**
 * Page principale Legal - Redirection vers le code penal
 * Cree par: Snowzy
 */

import { redirect } from 'next/navigation';

export default function LegalPage({ params }: { params: { agencyId: string } }) {
  redirect(`/dashboard/${params.agencyId}/legal/penal-code`);
}
