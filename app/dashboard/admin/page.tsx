import AccessCodeSettings from "@/components/admin/access-code-settings"

export const dynamic = "force-dynamic"

export default function AdminPage() {
  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Administração</h1>
      </header>

      <section className="space-y-6">
        <AccessCodeSettings />
      </section>
    </main>
  )
}
