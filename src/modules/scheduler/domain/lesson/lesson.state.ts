import {
  Collection,
  Embedded,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { DateTime } from 'luxon';
import { AggregateState } from '../../../shared/domain';
import {
  SchoolIdType,
  SubjectIdType,
  LessonIdType,
  ExactDateType,
} from '../../database';
import { SchoolId } from '../school';
import { ExactDate, TimeInterval } from '../shared';
import { SubjectId } from '../subject';
import { AssignedTeacher } from './assigned-teacher';
import { LessonId } from './lesson-id';

type CreateLessonState = {
  id: LessonId;
  subjectId: SubjectId;
  date: ExactDate;
  schoolId: SchoolId;
  time: TimeInterval;
  createdAt: DateTime;
  updatedAt: DateTime;
};

export abstract class LessonState extends AggregateState {
  @PrimaryKey({ name: 'id', type: LessonIdType })
  protected _id: LessonId;

  @Property({ name: 'subject_id', type: SubjectIdType })
  protected _subjectId: SubjectId;

  @Property({ name: 'date', type: ExactDateType })
  protected _date: ExactDate;

  @Property({ name: 'school_id', type: SchoolIdType })
  protected _schoolId: SchoolId;

  @OneToMany({
    entity: () => AssignedTeacher,
    mappedBy: 'lesson',
    orphanRemoval: true,
  })
  protected _assignedTeachers: Collection<AssignedTeacher>;

  @Embedded(() => TimeInterval, { prefix: 'time_' })
  protected _time: TimeInterval;

  @Property({ name: 'created_at' })
  protected _createdAt: DateTime;

  @Property({ name: 'updated_at' })
  protected _updatedAt: DateTime;

  @Property({ name: 'version', version: true })
  protected _version: number;

  protected constructor(state: CreateLessonState) {
    super();

    this._id = state.id;
    this._subjectId = state.subjectId;
    this._date = state.date;
    this._schoolId = state.schoolId;
    this._assignedTeachers = new Collection<AssignedTeacher>(this);
    this._time = state.time;
    this._createdAt = state.createdAt;
    this._updatedAt = state.updatedAt;
    this._version = 1;
  }
}
