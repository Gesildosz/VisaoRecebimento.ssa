export type UserRole = 'admin' | 'manager' | 'viewer'

export interface User {
  id: string
  fullName: string
  badge: string // Crachá - will be used as username
  sector: string
  company: string
  dateOfBirth: string // Formatted as 'dd/MM/yyyy'
  email: string
  whatsapp: string
  role: UserRole
  password?: string // Password should be handled securely, but for this demo, it's a string
  status: 'active' | 'inactive'
}
