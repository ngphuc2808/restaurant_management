import { PartialType } from '@nestjs/mapped-types';

import { CreateSocketDto } from '@/socket/dto/create-socket.dto';

export class UpdateSocketDto extends PartialType(CreateSocketDto) {}
