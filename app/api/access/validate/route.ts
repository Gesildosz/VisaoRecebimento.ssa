import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@/lib/neon"
import { ensureAccessCodesTable, type UserRole } from "@/lib/db"

// Lido do ambiente (mais seguro do que hardcode)
const MASTER_ADMIN_CODE = process.env.MASTER_ADMIN_CODE || "347568"

export async function POST(req: NextRequest) {
  await ensureAccessCodesTable()

  const body = (await req.json().catch(() => null)) as { code?: string } | null
  const code = (body?.code || "").trim()

  if (!code) {
    return NextResponse.json({ ok: false, error: "Código não informado." }, { status: 400 })
  }

  // 1) Código mestre -> admin total
  if (code === MASTER_ADMIN_CODE) {
    return NextResponse.json({ ok: true, role: "admin" as UserRole, owner: "Administrador" })
  }

  // 2) Verifica código cadastrado e ativo
  const rows = await sql<{ owner: string; role: UserRole | null }[]> /* sql */`SELECT owner, role
               FROM access_codes
              WHERE code = ${code} AND active = TRUE
              LIMIT 1;`

  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "Código inválido." }, { status: 401 })
  }

  const owner = rows[0].owner
  const role = (rows[0].role || "viewer") as UserRole // padrão viewer quando não definido
  return NextResponse.json({ ok: true, owner, role })
}
