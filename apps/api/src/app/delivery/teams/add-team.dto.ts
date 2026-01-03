import { IsNotEmpty, IsString } from 'class-validator';

export class AddTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
