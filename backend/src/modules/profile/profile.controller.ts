import { Controller, Get, Post, Body, Patch, Request } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import type { AuthenticatedUserRequest } from '../../common/interfaces/request.interface';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  create(@Body() createProfileDto: CreateProfileDto) {
    return this.profileService.create(createProfileDto);
  }

  @Get()
  findAll() {
    return this.profileService.findAll();
  }



  @Patch()
  update(@Request() req: AuthenticatedUserRequest, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profileService.update(req.user.username, updateProfileDto);
  }

}
