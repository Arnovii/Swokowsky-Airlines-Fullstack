import { Controller, Get, Body, Patch } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ActiveUser } from '../../common/decorators/active-user.decorator';
import type { PayloadInterface } from 'src/common/interfaces/payload.interface';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiHeader, ApiBody } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-profile.dto';




@ApiTags('Perfil de usuario')
@ApiBearerAuth('bearerAuth') // muestra candado en swagger y asocia el esquema 'bearerAuth'
@Controller('profile')
export class ProfileController {
  constructor(
    private readonly profileService: ProfileService,
  ) { }

  @Get()
  @ApiHeader({ name: 'Authorization', description: 'Se envía el Token en el apartado Authorization. El usuario que esté en el payload del JWT será de quien se verá su información en el perfil. Se debe validar dentro del profile el JWT enviado coincida con el del usuario logueado (Utilizar el provider para esto)' })
  @ApiOperation({ summary: 'Consigue toda la información del usuario autentificado (se debe enviar el bearer token en el apartado de Authorization). Roles admitidos: admin, cliente, root' })
  getProfileInfo(@ActiveUser() authenticatedUser: PayloadInterface) {
    const data = this.profileService.getProfileInfo(authenticatedUser.email)
    return data
  }

  @Patch()
  @ApiOperation({ summary: 'Actualizar la información del usuario autentificado (se debe enviar el bearer token en el apartado de Authorization). Roles admitidos: admin, cliente, root' })
  @ApiHeader({ name: 'Authorization', description: 'Se envía el Token en el apartado Authorization. El usuario que esté en el payload del JWT será de quien se verá su información en el perfil. Se debe validar dentro del profile el JWT enviado coincida con el del usuario logueado (Utilizar el provider para esto)' })
  update(@ActiveUser() authenticatedUser: PayloadInterface, @Body() data: UpdateUserDto) {
    return this.profileService.updateProfileInfo(+authenticatedUser.id_usuario, data);
  }

}
