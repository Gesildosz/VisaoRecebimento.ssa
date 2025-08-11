'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useToast } from '@/components/ui/use-toast'

type UserRole = 'admin' | 'manager' | 'viewer' | null

type UserRoleContextType = {
  role: UserRole
  setRole: (role: UserRole) => void
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined)

export function UserRoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Carregar o perfil do localStorage ao montar o componente
    const storedRole = localStorage.getItem('user_role')
    if (storedRole && ['admin', 'manager', 'viewer'].includes(storedRole)) {
      setRoleState(storedRole as UserRole)
    }
  }, [])

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole)
    if (newRole) {
      localStorage.setItem('user_role', newRole)
      toast({
        title: 'Perfil Atualizado',
        description: `Seu perfil agora é: ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
      })
    } else {
      localStorage.removeItem('user_role')
      toast({
        title: 'Perfil Removido',
        description: 'Seu perfil foi redefinido.',
      })
    }
  }, [toast])

  return (
    <UserRoleContext.Provider value={{ role, setRole }}>
      {children}
    </UserRoleContext.Provider>
  )
}

export function useUserRole() {
  const context = useContext(UserRoleContext)
  if (context === undefined) {
    throw new Error('useUserRole must be used within a UserRoleProvider')
  }
  return context
}
