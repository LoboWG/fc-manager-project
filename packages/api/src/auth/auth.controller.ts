import { Controller, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  @Get('discord')
  @UseGuards(AuthGuard('discord'))
  discordLogin() {
    // Cette fonction ne s'exécute pas, Passport redirige vers Discord
  }

  @Get('discord/callback')
  @UseGuards(AuthGuard('discord'))
  discordLoginCallback(@Req() req, @Res() res) {
    // Passport a fait son travail, l'utilisateur est dans req.user
    // Ici, nous pourrions générer un token JWT et le renvoyer
    // Pour l'instant, on redirige simplement vers une page de succès
    res.redirect('http://localhost:3001/dashboard'); // Redirige vers le frontend
  }
}