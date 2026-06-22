import { AdminShell } from '@/components/admin/AdminSidebar'
import { createClient } from '@/lib/supabase-server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userEmail = user?.email ?? 'Admin'
  const userInitial = userEmail.charAt(0).toUpperCase()

  return (
    <AdminShell userEmail={userEmail} userInitial={userInitial}>
      {children}
    </AdminShell>
  )
}
