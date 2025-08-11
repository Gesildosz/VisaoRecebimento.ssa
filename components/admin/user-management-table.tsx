'use client'

import * as React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { AddUserDialog } from './add-user-dialog'
import { toast } from '@/hooks/use-toast'
import { useUserRole } from '@/components/user-role-context'
import { User, UserRole } from '@/types/user' // Import User and UserRole

const initialUsers: User[] = [
  {
    id: '1',
    fullName: 'João Silva',
    badge: 'JS001',
    sector: 'Recebimento',
    company: 'JBS',
    dateOfBirth: '15/03/1985',
    email: 'joao.silva@jbs.com',
    whatsapp: '5511987654321',
    role: 'admin',
    password: 'password123',
    status: 'active',
  },
  {
    id: '2',
    fullName: 'Maria Souza',
    badge: 'MS002',
    sector: 'Expedição',
    company: 'JBS',
    dateOfBirth: '20/07/1990',
    email: 'maria.souza@jbs.com',
    whatsapp: '5521998765432',
    role: 'manager',
    password: 'password123',
    status: 'active',
  },
  {
    id: '3',
    fullName: 'Pedro Santos',
    badge: 'PS003',
    sector: 'Qualidade',
    company: 'JBS',
    dateOfBirth: '10/11/1992',
    email: 'pedro.santos@jbs.com',
    whatsapp: '5531976543210',
    role: 'viewer',
    password: 'password123',
    status: 'inactive',
  },
]

export function UserManagementTable() {
  const { role: currentUserRole } = useUserRole() // Get the current user role
  const [users, setUsers] = React.useState<User[]>(initialUsers)
  const [editingUser, setEditingUser] = React.useState<User | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const handleAddUser = (newUser: User) => {
    setUsers([...users, newUser])
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setIsEditDialogOpen(true)
  }

  const handleSaveEditedUser = (updatedUser: User) => {
    setUsers(users.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
    setEditingUser(null)
    setIsEditDialogOpen(false)
  }

  const handleDeleteUser = (id: string) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para excluir usuários.',
        variant: 'destructive',
      })
      return
    }
    setUsers(users.filter((user) => user.id !== id))
    toast({
      title: 'Usuário Excluído',
      description: 'O usuário foi removido com sucesso.',
      variant: 'destructive',
    })
  }

  const handleToggleStatus = (id: string) => {
    if (currentUserRole !== 'admin') {
      toast({
        title: 'Acesso Negado',
        description: 'Você não tem permissão para alterar o status de usuários.',
        variant: 'destructive',
      })
      return
    }
    setUsers(
      users.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      )
    )
    toast({
      title: 'Status Atualizado',
      description: 'O status do usuário foi alterado.',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Gerenciamento de Usuários</CardTitle>
          <CardDescription>Gerencie os usuários e suas permissões.</CardDescription>
        </div>
        {currentUserRole === 'admin' && <AddUserDialog onSubmitUser={handleAddUser} />}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome Completo</TableHead>
              <TableHead>Crachá</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Whatsapp</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.fullName}</TableCell>
                <TableCell>{user.badge}</TableCell>
                <TableCell>{user.sector}</TableCell>
                <TableCell>{user.company}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.whatsapp}</TableCell>
                <TableCell className="capitalize">{user.role}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      user.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {user.status === 'active' ? 'Ativo' : 'Inativo'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {currentUserRole === 'admin' ? (
                        <>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(user.id)}>
                            {user.status === 'active' ? 'Desativar' : 'Ativar'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteUser(user.id)}>
                            Excluir
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <DropdownMenuItem disabled>
                          Sem permissão
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {editingUser && (
          <AddUserDialog
            initialUser={editingUser}
            onSubmitUser={handleSaveEditedUser}
          />
        )}
      </CardContent>
    </Card>
  )
}
