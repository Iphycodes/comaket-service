import { UsersService } from './users.service';
import { JwtPayload } from '@common/decorators/get-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(user: JwtPayload): Promise<import("./schemas/user.schema").UserDocument>;
    updateProfile(user: JwtPayload, updateProfileDto: UpdateProfileDto): Promise<import("./schemas/user.schema").UserDocument>;
}
