import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { UpdateUserDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly userService: UsersService) { }


  async getProfileInfo(email: string) {
    // Usamos 'await' para esperar a que la promesa se resuelva
    const userData = await this.userService.findUserByEmail(email);

    if (userData) {
      const { password_bash, ...userWithoutPassword } = userData;
      return userWithoutPassword;
    } else {
      throw new Error('Usuario no encontrado');
    }
  }

  async updateProfileInfo(id: number, data: UpdateUserDto) {
    const userUploaded = await this.userService.updateUser(id,data);
    const { password_bash, ...userWithoutPassword } = userUploaded;
    return userWithoutPassword;
  }


}
