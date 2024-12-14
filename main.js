const ics = require("ics");
const fs = require("fs");
const csv = require("csv-parser");
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
//parse the csv file first
fs.createReadStream("./calendar.csv")
  .pipe(csv())
  .on("data", (data) => results.push(data))
  .on("end", () => {
    for (let i = 0; i < results.length; i++) {
      let start;
      let end;
      let duration;
      try {
        let date = results[i].DATE.split(" - ");
        start = date[0].split(" ");
        end = date[1].split(" ");
        duration =
          Math.ceil(
            (new Date(year, months.indexOf(end[1]), end[0]) -
              new Date(year, months.indexOf(start[1]), start[0])) /
              (24 * 60 * 60 * 7 * 1000),
          ) + 1;
      } catch {
        let date = results[i].DATE;
        start = date.split(" ");
        duration = 1;
      }

      let startTime;
      let endTime;
      let hours;
      let minutes;
      try {
        let time = results[i].DURATION.split(" - ");
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
          title: results[i].TITLE,
          description: results[i].DESCRIPTION,
          location: results[i].LOCATION,
        };
        currTime = new Date(currTime.getTime() + 7 * 24 * 60 * 60 * 1000);

        events.push(event);
      }
    }
    ics.createEvents(events, (error, value) => {
      if (error) {
        console.log(error);
        return;
      }
      fs.writeFileSync("calendar.ics", value);
    });
  });
