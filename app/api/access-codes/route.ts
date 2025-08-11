import { NextResponse } from "next/server"
import { sql } from "@/lib/neon"
import { ensureAccessCodesTable, type UserRole } from "@/lib/db"

// GET: lista todos os códigos (ativos e inativos)
export async function GET() {
  await ensureAccessCodesTable()
  const rows = await sql<
    { id: number; code: string; owner: string; role: UserRole | null; active: boolean; created_at: string }[]
  > /* sql */`SELECT id, code, owner, role, active, created_at
              FROM access_codes
              ORDER BY created_at DESC;`
  return NextResponse.json({ ok: true, items: rows })
}

// POST: cria novo código
export async function POST(req: Request) {
  await ensureAccessCodesTable()
  const body = await req.json().catch(() => ({}) as any)
  const owner = (body.owner ?? "").trim()
  const code = (body.code ?? "").trim()
  const role = body.role ? (String(body.role) as UserRole) : null
  const active = body.active === false ? false : true

  if (!owner || !code) {
    return NextResponse.json({ ok: false, error: "Campos obrigatórios: owner, code." }, { status: 400 })
  }
  if (code.length < 4 || code.length > 64) {
    return NextResponse.json({ ok: false, error: "Código deve ter entre 4 e 64 caracteres." }, { status: 400 })
  }
  if (role && !["admin", "manager", "viewer"].includes(role)) {
    return NextResponse.json({ ok: false, error: "Perfil inválido." }, { status: 400 })
  }
  if (code === (process.env.MASTER_ADMIN_CODE || "347568")) {
    return NextResponse.json({ ok: false, error: "Este código é reservado para administração." }, { status: 400 })
  }

  try {
    const rows = await sql<
      { id: number; code: string; owner: string; role: UserRole | null; active: boolean; created_at: string }[]
    > /* sql */`INSERT INTO access_codes (code, owner, role, active)
               VALUES (${code}, ${owner}, ${role}, ${active})
               RETURNING id, code, owner, role, active, created_at;`
    return NextResponse.json({ ok: true, item: rows[0] })
  } catch (e: any) {
    const msg = String(e?.message || e)
    if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("unique")) {
      return NextResponse.json({ ok: false, error: "Já existe um código idêntico." }, { status: 409 })
    }
    console.error("POST /api/access-codes error:", e)
    return NextResponse.json({ ok: false, error: "Erro ao salvar o código." }, { status: 500 })
  }
}
