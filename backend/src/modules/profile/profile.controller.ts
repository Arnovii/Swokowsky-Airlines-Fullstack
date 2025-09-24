import { Controller, Get, Post, Body, Patch, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { ApiBearerAuth, ApiTags, ApiOperation} from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-profile.dto';




@ApiTags('Perfil de usuario - Requiere token para autorización')
@ApiBearerAuth('bearerAuth') // muestra candado en swagger y asocia el esquema 'bearerAuth'
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ){}

  @Get()
  @ApiOperation({ summary: 'Consigue toda la información del usuario autentificado (se debe enviar el bearer token en el apartado de Authorization). Roles admitidos: admin, cliente, root' })  
  getProfileInfo(@ActiveUser() authenticatedUser: PayloadInterface) {
    const data = this.profileService.getProfileInfo(authenticatedUser.email)
    return data
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar la información del usuario autentificado (se debe enviar el bearer token en el apartado de Authorization). Roles admitidos: admin, cliente, root' })  
  update(@ActiveUser() authenticatedUser: PayloadInterface, @Body() data: UpdateUserDto) {
    return this.profileService.updateProfileInfo(+authenticatedUser.id_usuario, data);
  }

}
