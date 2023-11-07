"use strict";

const data = JSON.parse(localStorage.getItem("data"));
console.log("data4");

const prodCode = data.bookableItems[0].productOptionCode;
const seasons = data.bookableItems[0].seasons;
const startDate = seasons[0].startDate;
const endDate = seasons[0].endDate;
const daysOfWeek = seasons[0].pricingRecords[0].daysOfWeek;
const pricingRecords = seasons[0].pricingRecords;
const timedEntries = seasons[0].pricingRecords[0].timedEntries;

//functions
//filter by unavail func
function filterAvDatesByUnDates(filteredSeasonDates, unavailableDates) {
  const unavailableDateSet = new Set(unavailableDates);
  const filteredAvailableDates = filteredSeasonDates.filter(
    (date) => !unavailableDateSet.has(date)
  );
  console.log("FilDates", filteredAvailableDates);
  return filteredAvailableDates;
}
// filter days of the week
function filterDatesByDayOfWeek(filteredSeasonDates, daysOfWeek) {
  const filteredAvailableDates = filteredSeasonDates.filter((dateString) => {
    const date = new Date(dateString);
    const dayOfWeek = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toUpperCase();
    return daysOfWeek.includes(dayOfWeek);
  });

  console.log("daysfil", filteredAvailableDates);
  return filteredAvailableDates;
}

let availableDates = [];
let filteredSeasonDates = [];
let filteredAvailableDates = [];
let availableDays = [];

const firstDate = new Date(); // gets the current date and time
const lastDate = new Date();
lastDate.setFullYear(firstDate.getFullYear() + 1); // Set the end date to one year from the current date

while (firstDate < lastDate) {
  const year = firstDate.getFullYear(); // Extract the last two digits of the year
  const month = (firstDate.getMonth() + 1).toString().padStart(2, "0"); // Month is zero-based
  const day = firstDate.getDate().toString().padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;
  availableDates.push(formattedDate);

  firstDate.setDate(firstDate.getDate() + 1); // Move to the next day
}

console.log("availDates", availableDates);

// Extract s&e dates of each season and log dates within each season
data.bookableItems[0].seasons.forEach((season) => {
  const startDate = new Date(season.startDate);

  // Check if season.endDate is defined, if not, assign it the last date from availDates
  if (!season.endDate) {
    season.endDate = availableDates[availableDates.length - 1];
  }

  console.log(`Season: ${season.startDate} to ${season.endDate}`);

  const seasonDates = [];
  const currentDate = new Date(startDate);

  while (currentDate <= new Date(season.endDate)) {
    seasonDates.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  console.log(`Dates within the season: ${seasonDates.join(", ")}`);
});
// Iterate through the available dates and check if each date falls within any season
filteredSeasonDates = availableDates.filter((date) => {
  const currentDate = new Date(date);
  // Check if the date falls within any season
  return data.bookableItems[0].seasons.some(
    (season) =>
      currentDate >= new Date(season.startDate) &&
      currentDate <= new Date(season.endDate)
  );
});

console.log("Filtered Season Dates", filteredSeasonDates);
console.log("daysofweek", daysOfWeek);

if (prodCode) {
  console.log("Has PC");
  if (Array.isArray(prodCode) && prodCode.length > 1) {
    console.log("PC > 1");
  } else {
    console.log("1 PC");

    if (startDate && endDate) {
      console.log("S&E Date");
      if (Array.isArray(daysOfWeek) && daysOfWeek.length === 7) {
        console.log("Runs Every Day");
        if (Array.isArray(timedEntries) && timedEntries.length > 0) {
          console.log("Has TE");
          let hasUnavailableDates = timedEntries.some((entry) => {
            return (
              Array.isArray(entry.unavailableDates) &&
              entry.unavailableDates.length > 0
            );
          });
          if (hasUnavailableDates) {
            console.log("Has UnDates");
            // Filter UnDates that are unavailable for all start times
            unavailableDates = availableDates.filter((date) => {
              return data.bookableItems[0].seasons[0].pricingRecords[0].timedEntries.every(
                (entry) => {
                  return entry.unavailableDates.some(
                    (dateEntry) => dateEntry.date === date
                  );
                }
              );
            });
            console.log("unDates", unavailableDates);
            // Filter UnDates that are unavailable for all start times
            const unavailableDateSet = new Set(unavailableDates);
            filteredAvailableDates = filteredSeasonDates.filter(
              (date) => !unavailableDateSet.has(date)
            );
            console.log("Fil Dates", filteredAvailableDates);
          } else {
            console.log("No UnDates");
          } //Has No Unavailable Dates
        } else {
          console.log("No TE");
        } //Has No Timed Entries
      } else {
        console.log("Runs on: " + daysOfWeek.join(", "));
      } //else Runs on the following days
    } else if (startDate) {
      console.log("Start Date");
      if (Array.isArray(daysOfWeek) && daysOfWeek.length === 7) {
        console.log("Runs Every Day");
        if (Array.isArray(timedEntries) && timedEntries.length > 0) {
          console.log("Has TE");
          let hasUnavailableDates = timedEntries.some((entry) => {
            return (
              Array.isArray(entry.unavailableDates) &&
              entry.unavailableDates.length > 0
            );
          });
          if (hasUnavailableDates) {
            console.log("Has UnDates");
            //filterAvDatesByUnDates func
            unavailableDates = availableDates.filter((date) => {
              return timedEntries.every((entry) => {
                return entry.unavailableDates.some(
                  (dateEntry) => dateEntry.date === date
                );
              });
            });
            console.log("unDates", unavailableDates);
            //filterAvDatesByUnDates func
            filteredAvailableDates = filterAvDatesByUnDates(
              filteredSeasonDates,
              unavailableDates
            );
          } else {
            console.log("No Unates");
          } //Has No Unavailable Dates
        } else {
          console.log("No TE");
          let hasUnavailableDates = pricingRecords.some((entry) => {
            return (
              Array.isArray(entry.unavailableDates) &&
              entry.unavailableDates.length > 0
            );
          });

          if (hasUnavailableDates) {
            console.log("Has UnDates");

            // Filter UnDates that are unavailable for all start times
            unavailableDates = availableDates.filter((date) => {
              return data.bookableItems[0].seasons[0].pricingRecords.every(
                (entry) => {
                  return entry.unavailableDates.some(
                    (dateEntry) => dateEntry.date === date
                  );
                }
              );
            });
            console.log("unDates", unavailableDates);
            // filterAvDatesByUnDates func
            filteredAvailableDates = filterAvDatesByUnDates(
              filteredSeasonDates,
              unavailableDates
            );
          } else {
            console.log("No UnDates");
          } //Has No UnDates
        } //Has No Timed Entries
      } else {
        console.log("Runs on: " + daysOfWeek.join(", "));
        filteredAvailableDates = filterDatesByDayOfWeek(
          filteredSeasonDates,
          daysOfWeek
        );
      } //else Runs on the following days
    } else {
      console.log("No Start Date");
    } //else has no start date
  } // 1 PC
} else {
  console.log("No PC");
  if (startDate && endDate) {
    console.log("Has S&E Date");
    if (Array.isArray(daysOfWeek) && daysOfWeek.length === 7) {
      console.log("Every Day");
      if (Array.isArray(timedEntries) && timedEntries.length > 0) {
        console.log("Has TE");
        let hasUnavailableDates = timedEntries.some((entry) => {
          return (
            Array.isArray(entry.unavailableDates) &&
            entry.unavailableDates.length > 0
          );
        });
        if (hasUnavailableDates) {
          console.log("Has UnDates");
          // Filter UnDates that are un for all start times
          unavailableDates = availableDates.filter((date) => {
            return timedEntries.every((entry) => {
              return entry.unavailableDates.some(
                (dateEntry) => dateEntry.date === date
              );
            });
          });
          console.log("unDates", unavailableDates);
          // Filter UnDates that are un for all start times
          const unavailableDateSet = new Set(unavailableDates);
          filteredAvailableDates = filteredSeasonDates.filter(
            (date) => !unavailableDateSet.has(date)
          );
          console.log("Fil Dates", filteredAvailableDates);
        } else {
          console.log("No UnDates");
        } //Has No Unavailable Dates
      } else {
        console.log("No TE");
        let hasUnavailableDates = pricingRecords.some((entry) => {
          return (
            Array.isArray(entry.unavailableDates) &&
            entry.unavailableDates.length > 0
          );
        });

        if (hasUnavailableDates) {
          console.log("Has UnDates");

          // Filter UnDates that are un for all start times
          unavailableDates = availableDates.filter((date) => {
            return data.bookableItems[0].seasons[0].pricingRecords.every(
              (entry) => {
                return entry.unavailableDates.some(
                  (dateEntry) => dateEntry.date === date
                );
              }
            );
          });
          console.log("unDates", unavailableDates);
          //filterAvDatesByUnDates func
          filteredAvailableDates = filterAvDatesByUnDates(
            filteredSeasonDates,
            unavailableDates
          );
        } else {
          console.log("No UnDates");
        } //No Unavailable Dates
      } //No Timed Entries
    } else {
      console.log("Runs on: " + daysOfWeek.join(", "));
    } //following days
  } else if (startDate) {
    console.log("Has S Date");
  } else {
    console.log("No S Date");
  } //no start date
} //if product option code

$("#datepicker").datepicker({
  minDate: new Date(),
  dateFormat: "yy-mm-dd",
  beforeShow: function (input, inst) {
    var currentDate = new Date();
    var maxDate = new Date();
    maxDate.setFullYear(currentDate.getFullYear() + 1); // Set max date
    inst.settings.maxDate = maxDate; // Update maxDate
  },
  onSelect: function (dateText) {
    $("#selected_date").val(dateText);
    localStorage.setItem("currentDate", dateText);
    $(".button_options.next").attr("disabled", false);
    console.log(dateText);
  },
  beforeShowDay: function (date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const formattedDate = year + "-" + month + "-" + day;

    let isAvailable = filteredAvailableDates.includes(formattedDate);

    return [isAvailable, isAvailable ? "" : "unavailable-date", ""];
  },
});
