import { ExecutionContext, createParamDecorator } from "@nestjs/common";

//Este decorador @ActiveUser() nos permite tener como parámetro al usuario que mandó la request originalmente. 
//La forma en la que el controlador accede al request no es tan bonita ( @Request() ), por ello, creamos este controlador para tener un código mucho más legible y entendible 

// La única razón para conservar la forma de acceder anterior con @Request, es que nos interese trabajar con algún otro atributo/métod, etc, etc con el que venga el objeto 'request', como por ejemplo: iat?: number; --> issued at (opcional) | exp?: number; --> expiration (opcional)
export const ActiveUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);