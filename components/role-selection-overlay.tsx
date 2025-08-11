"use client"

import { useCallback, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { useUserRole } from "@/components/user-role-context"

type UserRole = "admin" | "manager" | "viewer"
const USER_ROLE_KEY = "user_role"

export function RoleSelectionOverlay() {
  const { role, setRole } = useUserRole()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setIsOpen(!role)
  }, [role])

  const handleOpenChange = (next: boolean) => {
    if (role) setIsOpen(next)
    else setIsOpen(true)
  }

  const validate = useCallback(async () => {
    const codeTrim = code.trim()
    if (!codeTrim) {
      toast({ title: "Informe o código", description: "Digite o código de acesso.", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/access/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeTrim }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast({
          title: "Código inválido",
          description: data.error || "Verifique com o administrador.",
          variant: "destructive",
        })
        return
      }
      const appliedRole: UserRole = data.role || "viewer"
      setRole(appliedRole)
      localStorage.setItem(USER_ROLE_KEY, appliedRole)
      toast({ title: "Acesso concedido" })
      setIsOpen(false)
    } catch {
      toast({ title: "Erro de rede", description: "Não foi possível validar o código agora.", variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }, [code, setRole, toast])

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => {
          if (!role) e.preventDefault()
        }}
        onEscapeKeyDown={(e) => {
          if (!role) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Acesso Restrito</DialogTitle>
          <DialogDescription>Insira o código de acesso para continuar.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="access-code" className="text-right">
              Código
            </Label>
            <Input
              id="access-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isSubmitting) validate()
              }}
              className="col-span-3"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <Button onClick={validate} disabled={isSubmitting}>
            {isSubmitting ? "Validando..." : "Entrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
