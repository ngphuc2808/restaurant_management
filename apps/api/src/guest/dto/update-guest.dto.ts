import { PartialType } from '@nestjs/mapped-types';

import { CreateGuestDto } from '@/guest/dto/create-guest.dto';

export class UpdateGuestDto extends PartialType(CreateGuestDto) {}
