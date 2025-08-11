import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@/lib/neon"
import { ensureAccessCodesTable, type UserRole } from "@/lib/db"

// PATCH: atualiza owner/role/active (não permite editar code pelo PATCH)
export async function PATCH(req: NextRequest, ctx: { params: { id: string } }) {
  await ensureAccessCodesTable()
  const id = Number(ctx.params.id)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido." }, { status: 400 })
  }

  const body = await req.json().catch(() => ({}) as any)
  const owner = typeof body.owner === "string" ? body.owner.trim() : undefined
  const role = typeof body.role === "string" || body.role === null ? (body.role as UserRole | null) : undefined
  const active = typeof body.active === "boolean" ? Boolean(body.active) : undefined

  if (role && !["admin", "manager", "viewer"].includes(role)) {
    return NextResponse.json({ ok: false, error: "Perfil inválido." }, { status: 400 })
  }
  if (owner === "" || owner === null) {
    return NextResponse.json({ ok: false, error: "owner não pode ser vazio." }, { status: 400 })
  }

  const sets: string[] = []
  const params: any[] = []
  if (owner !== undefined) {
    sets.push(`owner = $${sets.length + 1}`)
    params.push(owner)
  }
  if (role !== undefined) {
    sets.push(`role = $${sets.length + 1}`)
    params.push(role)
  }
  if (active !== undefined) {
    sets.push(`active = $${sets.length + 1}`)
    params.push(active)
  }
  if (sets.length === 0) {
    return NextResponse.json({ ok: false, error: "Nada para atualizar." }, { status: 400 })
  }

  const query = `
    UPDATE access_codes
       SET ${sets.join(", ")}
     WHERE id = $${sets.length + 1}
     RETURNING id, code, owner, role, active, created_at;
  `
  const rows = await sql(query, ...params, id)
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "Registro não encontrado." }, { status: 404 })
  }
  return NextResponse.json({ ok: true, item: rows[0] })
}

// DELETE: soft delete (active = false)
export async function DELETE(_req: NextRequest, ctx: { params: { id: string } }) {
  await ensureAccessCodesTable()
  const id = Number(ctx.params.id)
  if (!Number.isFinite(id)) {
    return NextResponse.json({ ok: false, error: "ID inválido." }, { status: 400 })
  }

  const rows = await sql /* sql */`
    UPDATE access_codes
       SET active = FALSE
     WHERE id = ${id}
     RETURNING id;
  `
  if (rows.length === 0) {
    return NextResponse.json({ ok: false, error: "Registro não encontrado." }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
