import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {

    getAllAuth(): { 
        reuturn [
            {
                id: 1,
                name: 'Brayan'
                email: 'sadoasdasfafs'
            }
        ]
    }
    createAuth(): { }
    updateAuth(): { }
    deleteAuth(): { }

}
