import { RoleType } from './user'

export interface IUser {
  id: string
  email: string
  role: RoleType
  isCompleted: boolean
}

export interface ISession {
  user: IUser
  expiresIn: number
}
