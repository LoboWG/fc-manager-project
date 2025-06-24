// Fichier : src/auth/authenticated.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    // Passport.js ajoute cette méthode .isAuthenticated() à la requête.
    // Elle retourne true si req.user existe, sinon false.
    return req.isAuthenticated();
  }
}