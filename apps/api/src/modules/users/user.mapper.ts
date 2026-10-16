import type { PrincipalDto, ProfileDto, UserDto } from '@mytutor/contracts';
import { ROLE_PERMISSIONS } from '@mytutor/contracts';
import type { UserRecord } from './user.types.js';

export function toProfileDto(user: UserRecord): ProfileDto {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    name: user.name,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    gender: user.gender,
    address: user.address,
    mobile: user.mobile,
  };
}

export function toUserDto(user: UserRecord): UserDto {
  return {
    ...toProfileDto(user),
    status: user.status,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function toPrincipalDto(user: Pick<UserRecord, 'id' | 'username' | 'name' | 'role'>): PrincipalDto {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions: [...ROLE_PERMISSIONS[user.role]],
  };
}
