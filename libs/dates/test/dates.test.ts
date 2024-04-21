// import { expect, test, describe } from "bun:test";
// import * as D from "dates";

// describe("dates", () => {
//   test("lastOctober", () => {
//     expect(D.lastOctober.month()).toBe(9);
//     expect(D.lastOctober.day()).toBe(0);
//   });

//   test("sortAscending", () => {
//     const days = [D.tomorrow, D.today];
//     const sorted = days.toSorted(D.sortAscending);
//     expect(D.sortAscending(D.today, D.tomorrow)).toBeLessThan(0);
//     expect(sorted[0].isSame(D.today)).toBeTruthy();
//     expect(sorted[1].isSame(D.tomorrow)).toBeTruthy();
//   });

//   test("sortDescending", () => {
//     const days = [D.today, D.tomorrow];
//     const sorted = days.toSorted(D.sortDescending);
//     expect(D.sortDescending(D.today, D.tomorrow)).toBeGreaterThan(0);
//     expect(sorted[1].isSame(D.today)).toBeTruthy();
//     expect(sorted[0].isSame(D.tomorrow)).toBeTruthy();
//   });

//   test("next", () => {
//     const sunday = D.nextSunday();
//     const monday = D.nextMonday();
//     const tuesday = D.nextTuesday();
//     const wednesday = D.nextWednesday();
//     const thursday = D.nextThursday();
//     const friday = D.nextFriday();
//     const saturday = D.nextSaturday();

//     expect(sunday.format("dddd")).toBe("Sunday");
//     expect(monday.format("dddd")).toBe("Monday");
//     expect(tuesday.format("dddd")).toBe("Tuesday");
//     expect(wednesday.format("dddd")).toBe("Wednesday");
//     expect(thursday.format("dddd")).toBe("Thursday");
//     expect(friday.format("dddd")).toBe("Friday");
//     expect(saturday.format("dddd")).toBe("Saturday");

//     const anyGivenSunday = D.nextDayOfWeek("sunday", sunday.add(1, "day"));
//     expect(sunday.isSame(anyGivenSunday)).toBeFalse();
//     expect(anyGivenSunday.format("dddd")).toBe("Sunday");
//   });

//   test("range", () => {
//     let range = D.dateRange("today");
//     expect(range.from.day()).toBe(D.today.day());
//     expect(range.from.month()).toBe(D.today.month());
//     expect(range.from.year()).toBe(D.today.year());

//     range = D.dateRange("yesterday");
//     expect(range.from.day()).toBe(D.yesterday.day());
//     expect(range.from.month()).toBe(D.yesterday.month());
//     expect(range.from.year()).toBe(D.yesterday.year());

//     range = D.dateRange("week");
//     expect(range.from.format("dddd")).toBe("Monday");
//     expect(range.to.format("dddd")).toBe(D.today.format("dddd"));

//     range = D.dateRange("month");
//     expect(range.from.date()).toBe(1);
//     expect(range.to.format("dddd")).toBe(D.today.format("dddd"));

//     range = D.dateRange("year");
//     expect(range.from.date()).toBe(1);
//     expect(range.from.month()).toBe(0);
//     expect(range.from.year()).toBe(D.today.year());

//     range = D.dateRange("financial-year");
//     expect(range.from.date()).toBe(1);
//     expect(range.from.month()).toBe(9);
//     expect(range.from.year()).toBe(D.lastOctober.year());

//     range = D.dateRange("30/01/1964");
//     expect(range.from.date()).toBe(30);
//     expect(range.from.month()).toBe(0);
//     expect(range.from.year()).toBe(1964);

//     range = D.dateRange("30/01/1964-23/12/1971");
//     expect(range.from.date()).toBe(30);
//     expect(range.from.month()).toBe(0);
//     expect(range.from.year()).toBe(1964);
//     expect(range.to.date()).toBe(24);
//     expect(range.to.month()).toBe(11);
//     expect(range.to.year()).toBe(1971);
//   });

//   test("nearest", () => {
//     const days = [0, 1, 2];
//     let nearest = D.nearestDay(...days);

//     const weekdays = ["wednesday", "friday", "SATURDAY"];
//     nearest = D.nearestDayOfWeek(...weekdays);
//   });
// });
