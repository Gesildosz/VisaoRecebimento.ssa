'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, MoreHorizontal } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { User, UserRole } from '@/types/user' // Import User and UserRole
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface AddUserDialogProps {
  initialUser?: User // Optional for editing
  onSubmitUser: (user: User) => void
}

export function AddUserDialog({ initialUser, onSubmitUser }: AddUserDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [fullName, setFullName] = React.useState(initialUser?.fullName || '')
  const [badge, setBadge] = React.useState(initialUser?.badge || '')
  const [sector, setSector] = React.useState(initialUser?.sector || '')
  const [company, setCompany] = React.useState(initialUser?.company || '')
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>(
    initialUser?.dateOfBirth ? format(new Date(initialUser.dateOfBirth.split('/').reverse().join('-')), 'yyyy-MM-dd') ? new Date(initialUser.dateOfBirth.split('/').reverse().join('-')) : undefined : undefined
  )
  const [email, setEmail] = React.useState(initialUser?.email || '')
  const [whatsapp, setWhatsapp] = React.useState(initialUser?.whatsapp || '')
  const [role, setRole] = React.useState<UserRole>(initialUser?.role || 'viewer')
  const [password, setPassword] = React.useState(initialUser?.password || '')
  const [errors, setErrors] = React.useState<Partial<User>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      setFullName(initialUser?.fullName || '')
      setBadge(initialUser?.badge || '')
      setSector(initialUser?.sector || '')
      setCompany(initialUser?.company || '')
      setDateOfBirth(
        initialUser?.dateOfBirth ? format(new Date(initialUser.dateOfBirth.split('/').reverse().join('-')), 'yyyy-MM-dd') ? new Date(initialUser.dateOfBirth.split('/').reverse().join('-')) : undefined : undefined
      )
      setEmail(initialUser?.email || '')
      setWhatsapp(initialUser?.whatsapp || '')
      setRole(initialUser?.role || 'viewer')
      setPassword(initialUser?.password || '') // Keep password for editing, but handle securely in real app
      setErrors({})
    }
  }, [open, initialUser])

  const validate = () => {
    const newErrors: Partial<User> = {}
    if (!fullName.trim()) newErrors.fullName = 'Nome completo é obrigatório.'
    if (!badge.trim()) newErrors.badge = 'Crachá é obrigatório.'
    if (!sector.trim()) newErrors.sector = 'Setor é obrigatório.'
    if (!company.trim()) newErrors.company = 'Empresa é obrigatória.'
    if (!dateOfBirth) newErrors.dateOfBirth = 'Data de nascimento é obrigatória.'
    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório.'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido.'
    }
    if (!whatsapp.trim()) newErrors.whatsapp = 'Whatsapp é obrigatório.'
    if (!password.trim() && !initialUser) newErrors.password = 'Senha é obrigatória para novos usuários.' // Password only required for new users
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      return
    }

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      const userToSubmit: User = {
        id: initialUser?.id || String(Date.now()), // Generate new ID if not editing
        fullName,
        badge,
        sector,
        company,
        dateOfBirth: dateOfBirth ? format(dateOfBirth, 'dd/MM/yyyy') : '',
        email,
        whatsapp,
        role,
        password,
        status: initialUser?.status || 'active', // Default to active for new users
      }

      onSubmitUser(userToSubmit)
      toast({
        title: initialUser ? 'Usuário Atualizado' : 'Usuário Adicionado',
        description: initialUser
          ? 'As informações do usuário foram atualizadas com sucesso.'
          : 'Novo usuário adicionado com sucesso.',
      })
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Erro',
        description: initialUser
          ? 'Falha ao atualizar o usuário.'
          : 'Falha ao adicionar o usuário.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const dialogTitle = initialUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'
  const submitButtonText = initialUser ? 'Salvar Alterações' : 'Salvar Usuário'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {initialUser ? (
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        ) : (
          <Button>Adicionar Usuário</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {initialUser
              ? 'Faça alterações no perfil do usuário aqui.'
              : 'Preencha os detalhes para adicionar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right">
              Nome Completo
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="col-span-3"
              aria-invalid={errors.fullName ? 'true' : 'false'}
            />
            {errors.fullName && <p className="col-span-4 col-start-2 text-sm text-red-500">{errors.fullName}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="badge" className="text-right">
              Crachá (Usuário)
            </Label>
            <Input
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="col-span-3"
              placeholder="Número do Crachá"
              aria-invalid={errors.badge ? 'true' : 'false'}
            />
            {errors.badge && <p className="col-span-4 col-start-2 text-sm text-red-500">{errors.badge}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sector" className="text-right">
              Setor
            </Label>
            <Input
              id="sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="col-span-3"
              aria-invalid={errors.sector ? 'true' : 'false'}
            />
            {errors.sector && <p className="col-span-4 col-start-2 text-sm text-red-500">{errors.sector}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="company" className="text-right">
              Empresa
            </Label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="col-span-3"
              aria-invalid={errors.company ? 'true' : 'false'}
            />
            {errors.company && <p className="col-span-4 col-start-2 text-sm text-red-500">{errors.company}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dateOfBirth" className="text-right">
              Data Nascimento
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "col-span-3 justify-start text-left font-normal",
                    !dateOfBirth && "text-muted-foreground"
                  )}
                  aria-invalid={errors.dateOfBirth ? 'true' : 'false'}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateOfBirth ? format(dateOfBirth, "PPP", { locale: ptBR }) : <span>Selecione a data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateOfBirth}
                  onSelect={setDateOfBirth}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
            {errors.dateOfBirth && <p className="col-span-4 col-start-2 text-sm text-red-500">{errors.dateOfBirth}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              aria-invalid={errors.email ? 'true' : 'false'}
            />
            {errors.email && <p className="col-span-4 col-start-2 text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="whatsapp" className="text-right">
              Whatsapp
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="col-span-3"
              placeholder="Ex: (XX) XXXXX-XXXX"
              aria-invalid={errors.whatsapp ? 'true' : 'false'}
            />
            {errors.whatsapp && <p className="col-span-4 col-start-2 text-sm text-red-500">{errors.whatsapp}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              Perfil
            </Label>
            <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
              <SelectTrigger id="role" className="col-span-3">
                <SelectValue placeholder="Selecione o perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
              placeholder={initialUser ? 'Deixe em branco para manter a senha atual' : 'Defina a senha'}
              aria-invalid={errors.password ? 'true' : 'false'}
            />
            {errors.password && <p className="col-span-4 col-start-2 text-sm text-red-500">{errors.password}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
