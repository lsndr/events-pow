import { Test } from '@nestjs/testing';
import {
  Group,
  GroupId,
  DailyRecurrence,
  School,
  SchoolId,
  RequiredTeachers,
  TimeInterval,
  TimeZone,
  Subject,
  SubjectId,
  WeeklyRecurrence,
} from '../../../domain';
import { DateTime } from 'luxon';
import { SubjectVersionsLoader } from './subject-versions.loader';
import { MikroORM } from '@mikro-orm/postgresql';
import { testMikroormProvider } from '../../../../../../test-utils';
import { MIKROORM_PROVIDER } from '../../../../shared/database';

describe('SubjectVersionsLoader', () => {
  let loader: SubjectVersionsLoader;
  let school: School;
  let orm: MikroORM;

  let subject1: Subject;
  let group: Group;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [],
      providers: [SubjectVersionsLoader, testMikroormProvider],
    }).compile();

    loader = moduleRef.get(SubjectVersionsLoader);
    orm = moduleRef.get(MIKROORM_PROVIDER);
  });

  beforeAll(async () => {
    const em = orm.em.fork();
    const now = DateTime.fromISO('2023-01-25T11:48:38', {
      zone: 'Europe/Moscow',
    });

    const schoolRepository = em.getRepository(School);
    const groupRepository = em.getRepository(Group);
    const subjectRepository = em.getRepository(Subject);

    school = School.create({
      id: SchoolId.create(),
      name: 'Test School',
      timeZone: TimeZone.create('Europe/Moscow'),
      now,
    });

    group = Group.create({
      id: GroupId.create(),
      school,
      name: 'Test Group',
      now,
    });

    subject1 = Subject.create({
      id: SubjectId.create(),
      school,
      name: 'Subject 1',
      recurrence: DailyRecurrence.create(),
      time: TimeInterval.create({
        startsAt: 720,
        duration: 60,
      }),
      group,
      requiredTeachers: RequiredTeachers.create(2),
      now: now.minus({ days: 2 }),
    });

    const subject2 = Subject.create({
      id: SubjectId.create(),
      school,
      name: 'Subject 2',
      recurrence: WeeklyRecurrence.create([0, 4]),
      time: TimeInterval.create({
        startsAt: 960,
        duration: 120,
      }),
      group,
      requiredTeachers: RequiredTeachers.create(1),
      now: now.minus({ weeks: 4 }),
    });

    schoolRepository.persist(school);
    groupRepository.persist(group);
    subjectRepository.persist(subject1);
    subjectRepository.persist(subject2);

    await em.flush();

    const subject = await subjectRepository
      .createQueryBuilder()
      .where({
        id: subject1.id.value,
      })
      .getSingleResult();

    if (!subject) {
      throw new Error('Subject Not found');
    }

    subject.setName('Subject 1 Version 2', now);
    subject.setTime(
      TimeInterval.create({
        startsAt: 120,
        duration: 600,
      }),
      now,
    );

    await em.flush();
  });

  it('should load subject 1 since subject 1 version 2 starts later', async () => {
    const subjects = await loader.load({
      schoolId: school.id.value,
      timeZone: 'Europe/Moscow',
      from: DateTime.fromISO('2023-01-25T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-26T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(subjects)).toEqual([
      {
        groupId: group.id.value,
        date: DateTime.fromISO('2023-01-25T00:00:00', {
          zone: 'Europe/Moscow',
        }),
        duration: 60,
        id: subject1.id.value,
        name: 'Subject 1',
        startsAt: 720,
        requiredTeachers: 2,
      },
    ]);
  });

  it.skip('should properly load week from 2023-01-23 to 2023-01-30T00:00:00', async () => {
    const subjects = await loader.load({
      schoolId: school.id.value,
      timeZone: 'Europe/Moscow',
      from: DateTime.fromISO('2023-01-23T00:00:00', {
        zone: 'Europe/Moscow',
      }),
      to: DateTime.fromISO('2023-01-30T00:00:00', {
        zone: 'Europe/Moscow',
      }),
    });

    expect(Array.from(subjects)).toEqual([]);
  });

  afterAll(async () => {
    await orm.close();
  });
});