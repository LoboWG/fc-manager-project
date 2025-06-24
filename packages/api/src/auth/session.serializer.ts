import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../../generated/prisma'; // On utilise le type User de Prisma

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  
  serializeUser(user: User, done: (err: Error | null, id: string) => void) {
    console.log('--- SERIALIZE USER CALLED ---'); // ESPION 3
    console.log('Storing user ID in session:', user.id); // ESPION 4
    done(null, user.id);
  }

  
  async deserializeUser(id: string, done: (err: Error | null, user: User | null) => void) {
    console.log('--- DESERIALIZE USER CALLED ---'); // ESPION 5
    console.log('Retrieving user ID from session:', id); // ESPION 6
    const user = await this.prisma.user.findUnique({ where: { id } });
    // On attache l'utilisateur complet à req.user
    done(null, user);
  }
}