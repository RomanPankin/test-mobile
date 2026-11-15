interface Names {
  /** Sunday first, as `Date.getDay()` counts. */
  weekdays: string[];
  months: string[];
}

/**
 * Short day and month names in the app's own languages. Written out because a phone's engine
 * may answer `Intl` in English whatever language it is asked for; a browser's is what `Intl`,
 * below, still serves for any other language a shop offers.
 */
const NAMES: Record<string, Names> = {
  en: {
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    months: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  ru: {
    weekdays: ["вс", "пн", "вт", "ср", "чт", "пт", "сб"],
    months: [
      "янв.",
      "февр.",
      "мар.",
      "апр.",
      "мая",
      "июн.",
      "июл.",
      "авг.",
      "сент.",
      "окт.",
      "нояб.",
      "дек.",
    ],
  },
  zh: {
    weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    months: [
      "1月",
      "2月",
      "3月",
      "4月",
      "5月",
      "6月",
      "7月",
      "8月",
      "9月",
      "10月",
      "11月",
      "12月",
    ],
  },
};

function namesOf(language: string | null): Names | undefined {
  return language ? NAMES[language.split("-")[0]] : undefined;
}

export function weekdayName(day: Date, language: string | null): string {
  return (
    namesOf(language)?.weekdays[day.getDay()] ??
    new Intl.DateTimeFormat(language ?? undefined, {
      weekday: "short",
    }).format(day)
  );
}

interface Clock {
  year: number;
  /** 0 for January. */
  month: number;
  day: number;
  /** 0 for Sunday. */
  weekday: number;
  hour: number;
  minute: number;
}

/**
 * The date as a clock in `timeZone` shows it, or this phone's own without one. Asked in numbers,
 * which `Intl` gives alike in any language; where it cannot, this phone's own clock stands.
 */
function clockOf(date: Date, timeZone?: string): Clock {
  try {
    if (timeZone) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
      }).formatToParts(date);
      const part = (type: string) =>
        Number(parts.find((item) => item.type === type)?.value);
      const [year, month, day] = [part("year"), part("month"), part("day")];
      const hour = part("hour") % 24;
      const minute = part("minute");

      if ([year, month, day, hour, minute].every(Number.isFinite)) {
        return {
          year,
          month: month - 1,
          day,
          weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
          hour,
          minute,
        };
      }
    }
  } catch {
    // An engine without this zone: the phone's own clock below.
  }

  return {
    year: date.getFullYear(),
    month: date.getMonth(),
    day: date.getDate(),
    weekday: date.getDay(),
    hour: date.getHours(),
    minute: date.getMinutes(),
  };
}

const twoDigits = (value: number) => String(value).padStart(2, "0");

/** The languages written out below; any other is `Intl`'s to say, and these return null. */
function writtenOut(language: string | null): "ru" | "zh" | null {
  const base = language?.split("-")[0];

  return base === "ru" || base === "zh" ? base : null;
}

/**
 * A date in words, as a browser writes it in Russian ("сб, 9 нояб., 19:30") or Chinese
 * ("11月9日周六 19:30"), whatever the phone's engine knows. Null in any other language.
 */
export function dateInWords(
  date: Date,
  language: string | null,
  options: {
    weekday?: boolean;
    year?: boolean;
    time?: boolean;
    timeZone?: string;
  },
): string | null {
  const written = writtenOut(language);

  if (!written) return null;

  const clock = clockOf(date, options.timeZone);
  const { weekdays, months } = NAMES[written];
  const time = options.time
    ? `${twoDigits(clock.hour)}:${twoDigits(clock.minute)}`
    : "";

  if (written === "zh") {
    const year = options.year ? `${clock.year}年` : "";
    const weekday = options.weekday ? weekdays[clock.weekday] : "";
    const day = `${year}${months[clock.month]}${clock.day}日${weekday}`;

    return time ? `${day} ${time}` : day;
  }

  const day = `${clock.day} ${months[clock.month]}`;

  return [
    options.weekday ? weekdays[clock.weekday] : "",
    options.year ? `${day} ${clock.year} г.` : day,
    time,
  ]
    .filter(Boolean)
    .join(", ");
}

/** "19:30", in the languages written out above; null in any other. */
export function clockInWords(
  date: Date,
  language: string | null,
): string | null {
  if (!writtenOut(language)) return null;

  const { hour, minute } = clockOf(date);

  return `${twoDigits(hour)}:${twoDigits(minute)}`;
}

export function monthName(day: Date, language: string | null): string {
  return (
    namesOf(language)?.months[day.getMonth()] ??
    new Intl.DateTimeFormat(language ?? undefined, { month: "short" }).format(
      day,
    )
  );
}
