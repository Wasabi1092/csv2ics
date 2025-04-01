# csv2ics
A script that converts .csv files to .ics files.
This was originally designed for the University of Adelaide, but can be used for other input sources if formatted correctly.

## Compilation

1. Ensure Go is installed

You can do this [here](https://go.dev/doc/install)

2. Download and put the script in the same folder as a file named `calendar.csv`

3. Run the script

```bash
cd <directory with script>
go run main.go
```

4. A `calendar.ics` should appear in the same folder, which you can import into any calendar.

## CSV Format

1. If using MyAdelaide, head to the "List List" view of the Timetable Section.
2. Then expand every subject that you have.
3. Starting from the first course (including the first course name) click and drag all the way to the bottom of your subjects, such that you have all courses, including their respective names highlighted.
4. Copy what you highlighted in the last section.
5. Paste it into a fresh google sheets document
6. Export as CSV file, rename this to `calendar.csv` and put it in the same directory as the script.
