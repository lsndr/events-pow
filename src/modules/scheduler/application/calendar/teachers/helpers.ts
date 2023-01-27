import { DateTime } from 'luxon';
import { RRule, RRuleSet, Frequency } from 'rrule';

type Periodicity =
  | {
      type: 'daily';
    }
  | {
      type: 'weekly';
      days: number[];
    }
  | {
      type: 'biweekly';
      week1: number[];
      week2: number[];
    }
  | {
      type: 'monthly';
      days: number[];
    };

type PeriodicityToRruleSetOptions = {
  periodicity: Periodicity;
  timeZone: string;
  start: DateTime;
  until?: DateTime;
};

function periodicityToRruleSet(options: PeriodicityToRruleSetOptions) {
  const rruleSet = new RRuleSet();

  const localStart = options.start.setZone(options.timeZone);
  const dtstart = new Date(
    Date.UTC(
      localStart.year,
      localStart.month - 1,
      localStart.day,
      localStart.hour,
      localStart.minute,
      localStart.second,
    ),
  );

  const localUntill = options.until?.setZone(options.timeZone);
  const until =
    localUntill &&
    new Date(
      Date.UTC(
        localUntill.year,
        localUntill.month - 1,
        localUntill.day,
        localUntill.hour,
        localUntill.minute,
        localUntill.second,
      ),
    );

  if (options.periodicity.type === 'daily') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.DAILY,
        dtstart,
        until,
        tzid: options.timeZone,
        count: 30,
      }),
    );
  } else if (options.periodicity.type === 'weekly') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.WEEKLY,
        dtstart,
        until,
        tzid: options.timeZone,
        byweekday: options.periodicity.days,
      }),
    );
  } else if (options.periodicity.type === 'biweekly') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.WEEKLY,
        interval: 2,
        dtstart,
        until,
        tzid: options.timeZone,
        byweekday: options.periodicity.week1,
      }),
    );

    const dtstart2 = new Date(dtstart);
    dtstart2.setDate(dtstart2.getDate() + 7);

    rruleSet.rrule(
      new RRule({
        freq: Frequency.WEEKLY,
        interval: 2,
        dtstart: dtstart2,
        until,
        tzid: options.timeZone,
        byweekday: options.periodicity.week1,
      }),
    );
  } else if (options.periodicity.type === 'monthly') {
    rruleSet.rrule(
      new RRule({
        freq: Frequency.MONTHLY,
        dtstart,
        until,
        tzid: options.timeZone,
        bymonthday: options.periodicity.days,
      }),
    );
  }

  return rruleSet;
}

function* rruleBetween(rruleSet: RRuleSet, from: DateTime, to: DateTime) {
  const timeZone = rruleSet.tzid();

  const localFrom = from.setZone(timeZone);
  const localTo = to.setZone(timeZone);

  const dates = rruleSet.between(
    localFrom.toJSDate(),
    localTo.toJSDate(),
    true,
  );

  for (const date of dates) {
    if (date.getTime() >= localTo.toMillis()) {
      continue;
    }

    yield DateTime.fromJSDate(date, { zone: timeZone });
  }
}

type ExtractDatesFromPeriodicityOptions = {
  periodicity: Periodicity;
  calculateSince: DateTime;
  calculateTill?: DateTime;
  timeZone: string;
};

export function extractDatesFromPeriodicity(
  from: DateTime,
  to: DateTime,
  options: ExtractDatesFromPeriodicityOptions,
) {
  const rruleSet = periodicityToRruleSet({
    timeZone: options.timeZone,
    start: options.calculateSince,
    until: options.calculateTill,
    periodicity: options.periodicity,
  });

  return rruleBetween(rruleSet, from, to);
}
