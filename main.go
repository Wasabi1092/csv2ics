package main

import (
	"crypto/rand"
	"errors"
	"fmt"
	"io"
	"os"
	"strings"
	"time"
)

type UUID [16]byte

type smallL struct {
	Start   time.Time
	End     time.Time
	Class   string
	Room    string
	Teacher string
	Notice  string
}

type bigL struct {
	Type               string `json:"D.XLATLONGNAME"`
	StartTime          string `json:"START_TIME"`
	EndTime            string `json:"END_TIME"`
	SubjectDescription string `json:"B.DESCR"`
	Location           string `json:"G.DESCR"`
	Room               string `json:"F.ROOM"`
	StartDate          string `json:"E.START_DT"`
	EndDate            string `json:"E.END_DT"`
}

type Lstruct struct {
	Status string `json:"status"`
	Data   struct {
		Query struct {
			NumRows int      `json:"numrows"`
			Name    string   `json:"queryname="`
			Rows    []smallL `json:"rows"`
		} `json:"query"`
	} `json:"data"`
}

func TimetableIcal(lessons []smallL, start, end time.Time) error {
	var err error
	iCalString := ""
	//build the start of the string
	iCalString += "BEGIN:VCALENDAR\n"
	iCalString += "VERSION:2.0\n"
	iCalString += "PRODID:taco/calendar\n"
	iCalString += "CALSCALE:GREGORIAN\n"
	iCalString += "METHOD:PUBLISH\n"
	iCalString += "X-WR-TIMEZONE:Australia/Adelaide\n"

	for _, lesson := range lessons {
		uuid, err := GenerateUUID()
		_, offset := lesson.Start.Zone()
		if err != nil {

			return errors.New("failed to generate UUID")
		}
		iCalString += "BEGIN:VEVENT\n"
		iCalString += "UID:" + uuid.String() + "\n"
		iCalString += "DTSTAMP:" + (time.Now().Add(time.Duration(-offset) * time.Second)).Format("20060102T150405Z") + "\n"
		iCalString += "DTSTART:" + (lesson.Start.Add(time.Duration(-offset) * time.Second)).Format("20060102T150405Z") + "\n"
		iCalString += "DTEND:" + (lesson.End.Add(time.Duration(-offset) * time.Second)).Format("20060102T150405Z") + "\n"
		iCalString += "SUMMARY:" + lesson.Class + "\n"
		iCalString += "DESCRIPTION:" + lesson.Teacher + "\n"
		iCalString += "LOCATION:" + lesson.Room + "\n"
		iCalString += "END:VEVENT\n"
	}
	iCalString += "END:VCALENDAR\n"
	file, err := os.OpenFile("calendar.ics", os.O_RDWR|os.O_CREATE, 0640)
	if err != nil {
		return errors.New("failed to create calendar file")
	}
	defer file.Close()
	_, err = file.WriteString(iCalString)
	if err != nil {
		return errors.New("failed to write calendar file")
	}
	return nil
}
func (u *UUID) String() string {
	return fmt.Sprintf("%x-%x-%x-%x-%x", u[0:4], u[4:6], u[6:8], u[8:10], u[10:])
}
func GenerateUUID() (u *UUID, err error) {
	// generates a version 4 UUID and returns the byte string
	u = new(UUID)
	_, err = rand.Read(u[:])
	if err != nil {
		return nil, errors.New("failed to generate UUID")
	}
	u[8] = (u[8] | 0x40) & 0x7F
	u[6] = (u[6] & 0xF) | (1 << 4)
	return u, nil
}

func FormatLessons(name string) ([]smallL, error) {
	var lessons []smallL
	file, err := os.OpenFile(name, os.O_RDWR, 0640)
	if err != nil {
		return nil, errors.New("File does not exist")
	}
	defer file.Close()
	buf, err := io.ReadAll(file)
	if err != nil {
		return nil, errors.New("Failed to read file")
	}

	text := string(buf)
	var bigLessons []bigL
	var subject string
	var class string
	temp := strings.Split(text, "\n")
	for _, line := range temp {
		temp2 := strings.SplitN(line, ",", 4)
		if line == "" {
			break
		}
		if temp2[1] == "" {
			if strings.Contains(temp2[0], "-") {
				subject = temp2[0]
			} else {
				class = temp2[0]
			}
		} else {
			times := strings.Split(temp2[2], " - ")
			dates := strings.Split(temp2[0], " - ")
			if len(dates) == 1 {
				bigLessons = append(bigLessons, bigL{
					Type:               class,
					StartTime:          times[0],
					EndTime:            times[1],
					SubjectDescription: subject,
					Location:           temp2[3],
					Room:               "",
					StartDate:          dates[0] + " 2025",
					EndDate:            dates[0] + " 2025",
				})
			} else {
				bigLessons = append(bigLessons, bigL{
					Type:               class,
					StartTime:          times[0],
					EndTime:            times[1],
					SubjectDescription: subject,
					Location:           temp2[3],
					Room:               "",
					StartDate:          dates[0] + " 2025",
					EndDate:            dates[1] + " 2025",
				})
			}

		}
	}
	for _, lesson := range bigLessons {
		startStr := lesson.StartDate + " " + lesson.StartTime
		start, err := time.ParseInLocation("02 Jan 2006 3:04 PM", startStr, time.Local)
		if err != nil {
			return nil, errors.New("cannot parse time")
		}
		endStr := lesson.StartDate + " " + lesson.EndTime
		end, err := time.ParseInLocation("02 Jan 2006 3:04 PM", endStr, time.Local)
		if err != nil {
			return nil, errors.New("cannot parse time")
		}
		finalDate, err := time.ParseInLocation("02 Jan 2006", lesson.EndDate, time.Local)
		if err != nil {
			return nil, errors.New("failed to parse date")
		}
		numLessons := int(finalDate.UnixMilli()-midnight(start).UnixMilli())/(7*24*60*60*1000) + 1
		for i := 0; i < numLessons; i++ {
			lessons = append(lessons, smallL{
				Start:   start.AddDate(0, 0, 7*i),
				End:     end.AddDate(0, 0, 7*i),
				Class:   lesson.SubjectDescription,
				Teacher: lesson.Type,
				Notice:  "",
				Room:    lesson.Location,
			})
		}

	}
	return lessons, nil
}
func midnight(t time.Time) time.Time {
	return time.Date(
		t.Year(), t.Month(), t.Day(),
		0, 0, 0, 0,
		t.Location(),
	)
}

func main() {
	lessons, err := FormatLessons("calendar.csv")
	if err != nil {
		errors.New("no calendar")
		return
	}
	err = TimetableIcal(lessons, time.Date(time.Now().Year(), 1, 1, 0, 0, 0, 0, time.Local), time.Date(time.Now().Year(), 12, 31, 23, 59, 59, 0, time.Local))
}
