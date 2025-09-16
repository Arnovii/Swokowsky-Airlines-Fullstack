import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Esto hace que todos los campos de CreateUserDto sean opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {}
