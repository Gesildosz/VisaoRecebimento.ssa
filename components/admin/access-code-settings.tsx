"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCcw, Trash2, EyeOff, Check } from "lucide-react"

type UserRole = "admin" | "manager" | "viewer"

type AccessCode = {
  id: number
  code: string
  owner: string
  role: UserRole | null
  active: boolean
  created_at: string
}

export default function AccessCodeSettings() {
  const { toast } = useToast()
  const [items, setItems] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(false)

  // Form
  const [owner, setOwner] = useState("")
  const [code, setCode] = useState("")
  const [role, setRole] = useState<UserRole | "">("")
  const [active, setActive] = useState(true)

  const canSubmit = useMemo(() => owner.trim() && code.trim(), [owner, code])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/access-codes", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Falha ao listar.")
      setItems(data.items as AccessCode[])
    } catch (e: any) {
      toast({ title: "Erro", description: String(e?.message || e), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  function genCode() {
    const v = Math.floor(100000 + Math.random() * 900000).toString()
    setCode(v)
  }

  async function addCode() {
    if (!canSubmit) {
      toast({ title: "Campos obrigatórios", description: "Preencha dono e código.", variant: "destructive" })
      return
    }
    try {
      const res = await fetch("/api/access-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: owner.trim(), code: code.trim(), role: role || null, active }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Não foi possível salvar.")
      toast({ title: "Código cadastrado", description: "O código foi criado com sucesso." })
      setOwner("")
      setCode("")
      setRole("")
      setActive(true)
      await load()
    } catch (e: any) {
      toast({ title: "Erro", description: String(e?.message || e), variant: "destructive" })
    }
  }

  async function toggleActive(item: AccessCode) {
    try {
      const res = await fetch(`/api/access-codes/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !item.active }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Falha ao atualizar.")
      await load()
    } catch (e: any) {
      toast({ title: "Erro", description: String(e?.message || e), variant: "destructive" })
    }
  }

  async function updateRole(item: AccessCode, newRole: UserRole | null) {
    try {
      const res = await fetch(`/api/access-codes/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Falha ao atualizar perfil.")
      await load()
    } catch (e: any) {
      toast({ title: "Erro", description: String(e?.message || e), variant: "destructive" })
    }
  }

  async function remove(item: AccessCode) {
    try {
      const res = await fetch(`/api/access-codes/${item.id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || "Falha ao excluir.")
      toast({ title: "Removido", description: "Código marcado como inativo." })
      await load()
    } catch (e: any) {
      toast({ title: "Erro", description: String(e?.message || e), variant: "destructive" })
    }
  }

  const roleLabel = (r: UserRole | null) =>
    r === "admin" ? "Administrador" : r === "manager" ? "Gerente" : r === "viewer" ? "Visualizador" : "—"

  const masked = (c: string) => {
    if (c.length <= 4) return "••" + c
    return c.slice(0, 2) + "•••" + c.slice(-2)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Códigos de Acesso</CardTitle>
        <CardDescription>
          Cadastre códigos com dono e perfil (opcional). Qualquer código ativo desbloqueia o acesso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Formulário */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="owner">Dono do código</Label>
            <Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Ex.: Maria Silva" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <div className="flex gap-2">
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex.: 123456" />
              <Button type="button" variant="secondary" onClick={genCode} title="Gerar aleatório">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Perfil (opcional)</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole | "")}>
              <SelectTrigger>
                <SelectValue placeholder="Sem perfil (aplica viewer)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="viewer">Visualizador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-3">
            <Button onClick={addCode} disabled={!canSubmit}>
              Adicionar código
            </Button>
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Dono</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    {loading ? "Carregando..." : "Nenhum código cadastrado."}
                  </TableCell>
                </TableRow>
              )}
              {items.map((it) => (
                <TableRow key={it.id}>
                  <TableCell>{it.id}</TableCell>
                  <TableCell>{it.owner}</TableCell>
                  <TableCell title={it.code} className="font-mono">
                    {masked(it.code)}
                  </TableCell>
                  <TableCell>
                    <Select value={it.role ?? "viewer"} onValueChange={(v) => updateRole(it, (v as UserRole) || null)}>
                      <SelectTrigger className="w-[170px]">
                        <SelectValue placeholder="viewer (padrão)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">Sem perfil (viewer)</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="viewer">Visualizador</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {it.active ? (
                      <Badge variant="default" className="inline-flex items-center gap-1">
                        <Check className="h-3 w-3" /> Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="inline-flex items-center gap-1">
                        <EyeOff className="h-3 w-3" /> Inativo
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => toggleActive(it)}>
                      {it.active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => remove(it)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
