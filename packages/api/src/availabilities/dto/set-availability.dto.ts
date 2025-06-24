import { IsEnum, IsNotEmpty } from 'class-validator';
// On importe notre Enum directement depuis le client Prisma généré !
import { AvailabilityStatus } from '../../../generated/prisma';

export class SetAvailabilityDto {
  @IsEnum(AvailabilityStatus)
  @IsNotEmpty()
  status: AvailabilityStatus;
}