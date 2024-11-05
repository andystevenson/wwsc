import { login, logout, type Staff, staff } from "@wwsc/lib-sumup-pos";
import { dayjs } from "@wwsc/lib-dates";
import { InsertShift } from "../db/db";

async function getStaff() {
  try {
    await login();
    let all = await staff();
    annotateStaff(all);
    await logout();
    return all;
  } catch (error) {
    console.error("getStaff", error);
    return [];
  }
}

function annotateStaff(staff: Staff[]) {
  for (let member of staff) {
    if (!member.mobile) {
      console.error("staff not properly formattted", member);
      continue;
    }
    let superuser = member.mobile.includes("superuser");
    let admin = member.mobile.includes("admin");
    let user = member.mobile.includes("user");

    if (!superuser && !admin && !user) {
      console.error("staff not properly formattted", member);
      continue;
    }

    if (superuser) member.isSuperuser = true;
    if (admin) member.isAdmin = true;
    if (user) member.isUser = true;

    let trustee = member.mobile.includes("trustee");
    let zeroHours = member.mobile.includes("zerohours");
    let permanent = member.mobile.includes("permanent");

    if (!trustee && !zeroHours && !permanent) {
      console.error("staff not properly formattted", member);
      continue;
    }

    if (trustee) member.isTrustee = true;
    if (zeroHours) member.isZeroHours = true;
    if (permanent) member.isPermanent = true;
  }
}

let allStaff: Staff[] = [];

async function findStaff(passcode: number | string, active: boolean = true) {
  if (!allStaff.length) {
    allStaff = await getStaff();
  }

  if (typeof passcode === "string") {
    return allStaff.find(
      (staff) => staff.id === passcode && (active ? staff.active : true),
    );
  }

  return allStaff.find(
    (staff) => staff.passcode === passcode && (active ? staff.active : true),
  );
}

async function findStaffByName(name: string, active: boolean = true) {
  if (!allStaff.length) {
    allStaff = await getStaff();
  }

  return allStaff.find(
    (staff) => staff.display_name === name && (active ? staff.active : true),
  );
}

async function findStaffAny(uid: string) {
  if (!allStaff.length) {
    allStaff = await getStaff();
  }

  return allStaff.find((staff) => staff.id === uid);
}

setInterval(async () => {
  // refresh the staff list every hour
  let all = await getStaff();
  let now = dayjs().format("HH:mm:ss");
  console.log(`${now} refreshed staff list`, all.length);
  allStaff = all;
}, 1000 * 60 * 60);

async function formatUpload(records: UploadRecord[]) {
  let shifts: InsertShift[] = [];
  let errors: UploadRecord[] = [];

  for (let record of records) {
    let user = await findStaffByName(record.who);
    if (!user) {
      console.error("user not found", record.who);
      continue;
    }

    let start = dayjs(record.clockin);
    let end = dayjs(record.clockout);

    if (!start.isValid() || !end.isValid()) {
      console.error("invalid dates", record.clockin, record.clockout);
      record.error = "invalid dates";
      errors.push(record);
      continue;
    }

    if (end.isBefore(start)) {
      console.error("end is before start", record.clockin, record.clockout);
      record.error = "end is before start";
      errors.push(record);
      continue;
    }

    if (record.day.toLowerCase() !== start.format("dddd").toLowerCase()) {
      console.error("day mismatch", record.day, start.format("dddd"));
      record.error = "day mismatch";
      errors.push(record);
      continue;
    }

    let diff = end.diff(start, "minutes");
    // @ts-ignore
    let duration = dayjs.duration(diff, "minutes");
    let shift: InsertShift = {
      uid: user.id,
      username: user.display_name,
      day: start.format("dddd"),
      start: start.format("YYYY-MM-DDTHH:mm"),
      end: end.format("YYYY-MM-DDTHH:mm"),
      duration: duration.format("HH:mm"),
      nobreaks: record.nobreaks === "yes",
      supervisor: record.supervisor === "yes",
      approved: false,
      notes: null,
      by: null,
      clockedout: "user",
    };

    shifts.push(shift);
  }

  return { shifts, errors };
}

type UploadRecord = {
  who: string;
  day: string;
  clockin: string;
  clockout: string;
  nobreaks: string;
  supervisor: string;
  error: string;
};

function permanentStaff() {
  return allStaff.filter((member) => member.isPermanent);
}

function trustees() {
  return allStaff.filter((member) => member.isTrustee);
}

function zeroHourStaff() {
  return allStaff.filter((member) => member.isZeroHours);
}

function activeStaff() {
  return allStaff.filter((member) => member.active);
}

function inactiveStaff() {
  return allStaff.filter((member) => !member.active);
}

function superusers() {
  return allStaff.filter((member) => member.isSuperuser);
}

function admins() {
  return allStaff.filter((member) => member.isAdmin);
}

function users() {
  return allStaff.filter((member) => member.isUser);
}

function ids(staff: Staff[]) {
  return staff.map((member) => member.id);
}

export {
  activeStaff,
  admins,
  findStaff,
  findStaffAny,
  findStaffByName,
  formatUpload,
  getStaff,
  ids,
  inactiveStaff,
  permanentStaff,
  superusers,
  trustees,
  users,
  zeroHourStaff,
};
