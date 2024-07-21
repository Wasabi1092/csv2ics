# csv2ics
A script that converts .csv files to .ics files.
This was originally designed for the University of Adelaide, but can be used for other input sources if formatted correctly.

## Usage

1. Install the dependencies

`npm install -S ics`
`npm install csv-parser`

2. Run `main.js`

`node main.js`

3. Find the `calendar.ics` file, located in the same folder as main.js
4. Import it to your calendar of choice

## CSV Format

TITLE, DATE, DAY, DURATION, LOCATION, DESCRIPTION

For the `DATE` column, the format is:
 - `DD MM`
For a single day event

For a recurring event every week:
 - `DD MM - DD MM`

For the `DURATION` column, the format is:
 - `HH:MM AM/PM - HH:MM AM/PM`

An example of a valid row would be
`Meeting, 24 Jun - 11 Sep, Wednesday, 9:00 AM - 11:00 AM, The Office, Talking about stuff`

The `.csv` file should be be called `calendar.csv`, and should be put into the same folder as the `main.js` file.
