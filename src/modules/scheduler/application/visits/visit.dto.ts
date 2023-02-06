import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { BiWeeklyRecurrenceDto } from './biweekly-recurrence.dto';
import { DailyRecurrenceDto } from './daily-recurrence.dto';
import { MonthlyRecurrenceDto } from './monthly-recurrence.dto';
import { TimeIntervalDto } from './time-interval.dto';
import { WeeklyRecurrenceDto } from './weekly-recurrence.dto';

@ApiExtraModels(
  DailyRecurrenceDto,
  WeeklyRecurrenceDto,
  BiWeeklyRecurrenceDto,
  MonthlyRecurrenceDto,
)
export class VisitDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(DailyRecurrenceDto) },
      { $ref: getSchemaPath(WeeklyRecurrenceDto) },
      { $ref: getSchemaPath(BiWeeklyRecurrenceDto) },
      { $ref: getSchemaPath(MonthlyRecurrenceDto) },
    ],
  })
  recurrence:
    | DailyRecurrenceDto
    | WeeklyRecurrenceDto
    | BiWeeklyRecurrenceDto
    | MonthlyRecurrenceDto;

  @ApiProperty({
    type: TimeIntervalDto,
  })
  time: TimeIntervalDto;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  requiredEmployees: number;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    type: 'string',
    format: 'date-time',
  })
  updatedAt: string;

  constructor(dto: VisitDto) {
    this.id = dto?.id;
    this.name = dto?.name;
    this.recurrence = dto?.recurrence;
    this.time = dto?.time;
    this.clientId = dto?.clientId;
    this.requiredEmployees = dto?.requiredEmployees;
    this.createdAt = dto?.createdAt;
    this.updatedAt = dto?.updatedAt;
  }
}
