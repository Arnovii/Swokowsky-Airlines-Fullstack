import {
  IsString,
  IsEmail,
  IsEnum,
  IsDateString,
  Length,
  IsInt,
} from 'class-validator';
import {nationalities, usuario_genero} from '@prisma/client';
import { Transform } from 'class-transformer';

/*
| Campo en `usuario`       | ¿Viene en DTO?  | Notas                                                                      |
| ------------------------ | --------------  | -------------------------------------------------------------------------- |
| `id_usuario`             | ❌ No           | Autogenerado por la BD                                                     |
| `tipo_usuario`           | ❌ No           | Lo defines tú en el backend (`CLIENTE` en /users, `ADMIN` en /root)        |
| `dni`                    | ✅ Sí           |                                                                            |
| `nombre`                 | ✅ Sí           |                                                                            |
| `apellido`               | ✅ Sí           |                                                                            |
| `fecha_nacimiento`       | ✅ Sí           |                                                                            |
| `nacionalidad`           | ✅ Sí           |                                                                            |
| `direccion_facturacion`  | ❌ No           | Lo podrías dejar `NULL` o vacío hasta que el usuario lo modifique          |
| `genero`                 | ✅ Sí           |                                                                            |
| `correo`                 | ✅ Sí           |                                                                            |
| `username`               | ✅ Sí           |                                                                            |
| `password_bash`          | ✅ Sí           | Recuerda **hashearla** en el backend                                       |
| `img_url`                | ✅ Sí           |                                                                            |
| `suscrito_noticias`      | ❌ No           | Se puede inicializar en `false`                                            |
| `creado_en`              | ❌ No           | Se debe setear en backend con `new Date()`                                 |
| `tarjeta[]` / `ticket[]` | ❌ No           | Relaciones, no se envían en el POST inicial                                |

*/
export class CreateUserDto {
  @IsInt()
  dni: number;

  @IsString()
  nombre: string;

  @IsString()
  apellido: string;

  @IsDateString()
  fecha_nacimiento: string;

  @IsEnum(nationalities)
  nacionalidad: nationalities;

  @IsEnum(usuario_genero)
  genero: usuario_genero;

  @IsEmail()
  correo: string;

  @Transform(({value}) => value.trim())
  @IsString()
  username: string;

  @Transform(({value}) => value.trim())
  @IsString()
  @Length(8, 255)
  password_bash: string;

  @IsString()
  img_url: string;
}
