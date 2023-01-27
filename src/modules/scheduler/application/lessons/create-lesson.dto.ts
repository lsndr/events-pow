import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TimeIntervalDto } from '../subjects/time-interval.dto';

export class CreateLessonDto {
  @IsDateString()
  @ApiProperty({
    format: 'date',
  })
  date: string;

  @ArrayUnique()
  @IsString({ each: true })
  @IsArray()
  @ApiProperty({
    type: [String],
  })
  teacherIds: string[];

  @ApiProperty({
    type: TimeIntervalDto,
  })
  @ValidateNested()
  @Type(() => TimeIntervalDto)
  timeInterval: TimeIntervalDto;

  constructor(dto: CreateLessonDto) {
    this.date = dto?.date;
    this.teacherIds = dto?.teacherIds;
    this.timeInterval = dto?.timeInterval;
  }
}
