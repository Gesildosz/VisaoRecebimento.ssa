"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useUserRole } from "@/components/user-role-context"
import { Check, Trash2 } from "lucide-react"

type Role = "admin" | "manager" | "viewer"

const USER_ROLE_KEY = "user_role"
const CURRENT_USER_BADGE_KEY = "current_user_badge"
const ACCESS_CODE_VALIDATED_KEY = "access_code_validated"

export function ProfileAssignmentCard() {
  const { toast } = useToast()
  const { role, setRole } = useUserRole()
  const [badge, setBadge] = useState("")
  const [fullName, setFullName] = useState("")
  const [assignedRole, setAssignedRole] = useState<Role | "">("")
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const storedBadge = localStorage.getItem(CURRENT_USER_BADGE_KEY) || ""
    const storedRole = (localStorage.getItem(USER_ROLE_KEY) as Role | null) || null
    setBadge(storedBadge)
    setAssignedRole(storedRole ?? "")
    setLoaded(true)
  }, [])

  const handleSave = useCallback(() => {
    if (!assignedRole) {
      toast({
        title: "Selecione um perfil",
        description: "É necessário escolher um perfil para salvar.",
        variant: "destructive",
      })
      return
    }
    if (!badge.trim()) {
      toast({
        title: "Informe o crachá",
        description: "Preencha o campo Crachá para identificação.",
        variant: "destructive",
      })
      return
    }
    localStorage.setItem(CURRENT_USER_BADGE_KEY, badge.trim())
    localStorage.setItem(USER_ROLE_KEY, assignedRole)
    setRole(assignedRole)
    toast({
      title: "Perfil cadastrado",
      description: `Perfil '${assignedRole}' definido para o crachá ${badge}.`,
    })
    // Notifica outras abas para reavaliar overlay
    window.dispatchEvent(new StorageEvent("storage", { key: USER_ROLE_KEY, newValue: assignedRole }))
  }, [assignedRole, badge, setRole, toast])

  const handleClear = useCallback(() => {
    // Limpa perfil do dispositivo
    localStorage.removeItem(CURRENT_USER_BADGE_KEY)
    localStorage.removeItem(USER_ROLE_KEY)
    // Limpa validação do código para exigir novamente
    localStorage.removeItem(ACCESS_CODE_VALIDATED_KEY)
    setBadge("")
    setAssignedRole("")
    setRole(null)
    toast({
      title: "Perfil removido",
      description: "O perfil e a validação de código foram limpos. Será necessário digitar o código novamente.",
      variant: "destructive",
    })
    // Notifica outras abas para reabrir o overlay
    window.dispatchEvent(new StorageEvent("storage", { key: USER_ROLE_KEY, newValue: "" }))
  }, [setRole, toast])

  if (!loaded) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cadastro de Perfil do Dispositivo</CardTitle>
        <CardDescription>
          O administrador deve cadastrar o perfil de acesso neste dispositivo. Usuários não escolhem o perfil.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="full-name" className="text-right">
            Nome
          </Label>
          <Input
            id="full-name"
            className="col-span-3"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="badge" className="text-right">
            Crachá
          </Label>
          <Input
            id="badge"
            className="col-span-3"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
            placeholder="Ex.: JS001"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label className="text-right">Perfil</Label>
          <Select value={assignedRole} onValueChange={(v: Role) => setAssignedRole(v)}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Selecione um perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="manager">Gerente</SelectItem>
              <SelectItem value="viewer">Visualizador</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-sm text-muted-foreground">
          Perfil atual neste dispositivo: <span className="font-medium">{role ?? "não definido"}</span>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          Salvar perfil
        </Button>
        <Button variant="destructive" onClick={handleClear}>
          <Trash2 className="mr-2 h-4 w-4" />
          Limpar
        </Button>
      </CardFooter>
    </Card>
  )
}
