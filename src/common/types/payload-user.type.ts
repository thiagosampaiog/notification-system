import { Role } from "./role.enum"

export interface AuthenticatedUser {
  sub: string
  firstName: string
  secondName: string
  phone: string
  email: string
  role: Role
}