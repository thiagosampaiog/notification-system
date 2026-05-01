import { ROLES_KEY } from '@common/decorators/role.decorator';
import { Role } from '@common/types/role.enum';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles: Role[] | undefined = this.reflector.getAllAndOverride<
      Role[]
    >(ROLES_KEY, [context.getClass(), context.getHandler()]);

    if (!requiredRoles?.length) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
