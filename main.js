const ics = require("ics");
const fs = require("fs");
const event = {
  // [yyyy, mm, dd, hh, mm]
  start: [2018, 1, 1, 6, 0],
  duration: { hours: 6, minutes: 30 },
  title: "Bolder Boulder",
  description: "Annual 10-kilometer run in Boulder, Colorado",
  location: "Folsom Field, University of Colorado (finish line)",
}; //template for events
let events = [];

const year = 2025;

const months = [
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
];
let results = [];

function parseItem(item, subject_name, item_name) {
  events = [];
  let start;
  let end;
  let duration;
  try {
    let date = item[0].split(" - ");
    start = date[0].split(" ");
    end = date[1].split(" ");
    duration =
      Math.ceil(
        (new Date(year, months.indexOf(end[1]), end[0]) -
          new Date(year, months.indexOf(start[1]), start[0])) /
          (24 * 60 * 60 * 7 * 1000),
      ) + 1;
  } catch {
    console.error("CSV not formatted properly. Check all dates and time");
    return;
  }
  let startTime;
  let endTime;
  let hours;
  let minutes;
  try {
    let time = item[2].split(" - ");
    startTime = time[0].split(" ");
    endTime = time[1].split(" ");
    startTime[0] = startTime[0].split(":");
    startTime[0][0] = parseInt(startTime[0][0]);
    startTime[0][1] = parseInt(startTime[0][1]);
    endTime[0] = endTime[0].split(":");
    endTime[0][0] = parseInt(endTime[0][0]);
    endTime[0][1] = parseInt(endTime[0][1]);
    if (startTime[1] == "PM" && startTime[0][0] != 12) {
      startTime[0][0] += 12;
    }
    if (endTime[1] == "PM" && endTime[0][0] != 12) {
      endTime[0][0] += 12;
    }
  } catch {
    console.log("Error occured in parsing time");
    console.log(`Please check line ${i + 2} for more details.`);
  }
  let currTime = new Date(
    year,
    months.indexOf(start[1]),
    start[0],
    startTime[0][0],
    startTime[0][1],
  );
  for (let j = 0; j < duration; j++) {
    let event = {
      start: [
        year,
        currTime.getMonth() + 1,
        currTime.getDate(),
        startTime[0][0],
        startTime[0][1],
      ],
      end: [
        year,
        currTime.getMonth() + 1,
        currTime.getDate(),
        endTime[0][0],
        endTime[0][1],
      ],
      title: item_name,
      description: subject_name,
      location: item[3],
    };
    currTime = new Date(currTime.getTime() + 7 * 24 * 60 * 60 * 1000);
    events.push(event);
  }
  return events;
}
title = "";
subject = "";
//parse the csv file first
text = fs.readFileSync("calendar.csv", "utf8");

results = text.split("\n");
console.log;
for (let i = 0; i < results.length; i++) {
  line = results[i];
  first = line.slice(0, line.indexOf(","));
  temp = line.slice(line.indexOf(",") + 1);
  split_line = [];
  if (temp.indexOf(",") == 0) {
    if (first.search("-") == -1) {
      title = split_line[0];
    } else {
      subject = split_line[0];
    }
  } else if (first == "") {
    break;
  } else {
    for (let i = 0; i < 3; i++) {
      split_line.push(line.slice(0, line.indexOf(",")));
      line = line.slice(line.indexOf(",") + 1);
    }
    line.replace('"', "");
    line.replace("\r", "");
    split_line.push(line);
    events = events.concat(parseItem(split_line, subject, title));
  }
}
ics.createEvents(events, (error, value) => {
  if (error) {
    console.log(error);
    return;
  }
  fs.writeFileSync("calendar.ics", value);
});
