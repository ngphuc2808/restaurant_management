import { IsNotEmpty, IsNumber } from 'class-validator';

export class GuestLogoutReqDto {
  @IsNotEmpty()
  @IsNumber()
  id: number;
}
