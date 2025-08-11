import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { cn } from "@/lib/utils"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar" // Importar SidebarInset
import { AppRightSidebar } from "@/components/app-right-sidebar" // Corrigido o import para AppRightSidebar
import { UserRoleProvider } from "@/components/user-role-context"
import { Toaster } from "@/components/ui/toaster"
import { RoleSelectionOverlay } from "@/components/role-selection-overlay"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Recebimento & Expedição",
  description: "Sistema de Gerenciamento de Recebimento e Expedição de Veículos",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.className)}>
        <UserRoleProvider>
          <SidebarProvider defaultOpen={false}> {/* Adicionado defaultOpen para controlar o estado inicial da sidebar */}
            <AppRightSidebar /> {/* Usando o componente AppRightSidebar */}
            <SidebarInset> {/* Envolvendo children com SidebarInset */}
              {children}
            </SidebarInset>
          </SidebarProvider>
          <RoleSelectionOverlay />
        </UserRoleProvider>
        <Toaster />
      </body>
    </html>
  )
}
