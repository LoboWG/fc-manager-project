import { Controller, Get, UseGuards, Req, Res, Redirect } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthenticatedGuard } from './authenticated.guard';
import { Response } from 'express'; // <-- Nouvel import

@Controller('auth')
export class AuthController {
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordLogin() {
    // Reste vide
  }

  // --- ON MODIFIE CETTE MÉTHODE POUR LE DÉBOGAGE ---
  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  async discordLoginCallback(@Req() req: any, @Res() res: Response) { // On injecte @Res pour gérer la redirection manuellement
    console.log('--- DISCORD CALLBACK CALLED ---');
    console.log('User object in request after Guard:', req.user?.username);

    // On appelle manuellement req.logIn() qui EST la fonction qui déclenche serializeUser
    req.logIn(req.user, (err) => {
      if (err) {
        console.error('Error during manual req.logIn:', err);
        return res.status(500).send('Failed to create session');
      }
      // Si ce log apparaît, c'est que la sérialisation a fonctionné !
      console.log('Manual req.logIn successful. Redirecting now...');
      return res.redirect('http://localhost:3001/dashboard');
    });
  }
  // ---------------------------------------------------

  @Get('logout')
  //... Le reste du fichier ne change pas ...
  @Redirect('http://localhost:3001', 302)
  logout(@Req() req: any) {
    req.logout((err) => {
      if (err) { console.log('Error logging out:', err); }
      console.log('--- LOGOUT CALLED ---');
    });
  }

  @Get('me')
  @UseGuards(AuthenticatedGuard)
  getProfile(@Req() req: any) {
    console.log('--- GET PROFILE (/me) CALLED ---');
    return req.user;
  }
}