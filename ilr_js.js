
$(document).on('click', '.removeButton', function () {
    $(this).parent("div").remove();
    alert('Update Plot!!!')
});

$('#cmd').click(function () {
    $('#content').append('<div class="date_range" <br>Days Off <input class="datepicker_start"/> <input class="datepicker_end"/> <button id="del" class="removeButton">Delete range</button> </div>');
});

$('body').on('focus', ".datepicker_start, .datepicker_end", function () {
    $(this).datepicker({
        dateFormat: 'dd/mm/yy'
    });
});


// var days_out = [[dateFromString('30/12/2018'), dateFromString('12/01/2019')],
// [dateFromString('28/05/2019'), dateFromString('02/06/2019')],
// [dateFromString('03/06/2019'), dateFromString('07/06/2019')],
// [dateFromString('16/08/2019'), dateFromString('24/08/2019')],
// [dateFromString('04/09/2019'), dateFromString('10/09/2019')],
// [dateFromString('03/01/2020'), dateFromString('18/01/2020')],
// [dateFromString('28/10/2020'), dateFromString('04/04/2021')],
// [dateFromString('14/12/2021'), dateFromString('26/01/2022')]]
var days_out = []


$(document).on('change', '.datepicker_start, .datepicker_end', function () {

    var myClass = $(this).attr("class");

    if (myClass.includes("datepicker_start")) {
        var $start_date = $(this).val();
        var $end_date = $(this).closest('.date_range').find('.datepicker_end').val();
    } else {
        var $start_date = $(this).closest('.date_range').find('.datepicker_start').val();
        var $end_date = $(this).val();
    }

    if ($start_date && $end_date) {

        var date1 = dateFromString($start_date)
        var date2 = dateFromString($end_date)

        if (date2 > date1) {
            days_out.push([date1, date2]);
            update_dates()
        } else {
            $(this).val("")
            alert('End date should be latar than Start Date')
        }
    }
})


function addDays(date, days) {
    const copy = new Date(Number(date))
    copy.setDate(date.getDate() + days)
    return copy
}

function getRange(startDate, stopDate) {
    var dateArray = new Array();
    var currentDate = startDate;
    while (currentDate <= stopDate) {
        dateArray.push({
            date: new Date(currentDate),
            is_day_off: 0,
            cumulative_abscence: 0
        });
        currentDate = addDays(currentDate, 1);
    }
    return dateArray;
}

function dateFromString(strigDate) {
    var parts = strigDate.split('/');
    // Please pay attention to the month (parts[1]); JavaScript counts months from 0:
    // January - 0, February - 1, etc.
    var mydate = new Date(parts[2], parts[1] - 1, parts[0]);
    return mydate
}

function update_days_out(){

    var messages = document.querySelectorAll(".datepicker_start");
    for (var i = 0; i < messages.length; i++) {
        var str = messages[i].value;
        console.log(str)
    }

    var messages = document.querySelectorAll(".datepicker_end");
    for (var i = 0; i < messages.length; i++) {
        var str = messages[i].value;
        console.log(str)
    }

}

function update_dates() {

    var max_cumulative_abscence = 0

    for (var i = 0; i < date_range.length; i++) {

        for (let index = 0; index < days_out.length; index++) {
            if (date_range[i].date >= days_out[index][0] && date_range[i].date <= days_out[index][1] && !(i_days_checked.includes(index))) {
                date_range[i].is_day_off = 1
                if (date_range[i].date.getTime() == days_out[index][1].getTime()) {
                    i_days_checked.push(index);
                    break;
                }
            }
        }
        var array_slice = date_range.slice(0, i + 1)

        if (i > 365) {
            array_slice = date_range.slice(i - 365, i);
        }

        var cum = 0
        for (let index = 0; index < array_slice.length; index++) {
            cum = cum + array_slice[index].is_day_off;
        }

        date_range[i].cumulative_abscence = cum;

        if (cum > max_cumulative_abscence) {
            max_cumulative_abscence = cum;
        }

    }

    var data = [];
    for (var i = 0; i < date_range.length; i++) {
        data.push({ date: date_range[i].date, value: date_range[i].cumulative_abscence, limit: 180, a: [] });
    }


    for (let index = dateAxis.axisRanges.length - 1; index > 0; index--) {
        dateAxis.axisRanges.removeIndex(index)
    }

    if (max_cumulative_abscence > 180) {
        valueAxis.max = max_cumulative_abscence + 10;
    }

    // Paint in red the Absence days
    var range = [];
    for (let index = 0; index < days_out.length; index++) {
        range[index] = dateAxis.createSeriesRange(series);
        range[index].date = days_out[index][0];
        range[index].endDate = days_out[index][1];
        range[index].contents.fill = am4core.color("#f00");
        range[index].contents.fillOpacity = 0.2;
        range[index].name = index;
    }

    var range2 = [];
    range2 = dateAxis.createSeriesRange(series);
    range2.date = addDays(today, -2);
    range2.endDate = addDays(today, 2);
    range2.contents.fill = am4core.color("#f00");
    range2.contents.fillOpacity = 1;

    chart.data = data;

}


var today = new Date();
var one_year_ago = new addDays(today, -365);
var first_day = new dateFromString('04/06/2018')
var last_day = new addDays(first_day, 365 * 5)
var date_range = getRange(first_day, last_day)

var data = [];
var i_days_checked = [];

// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

var chart = am4core.create("chartdiv", am4charts.XYChart);


// Create axes
var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.minGridDistance = 60;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.max = 190;

// Create series
var series = chart.series.push(new am4charts.LineSeries());
series.dataFields.valueY = "value";
series.dataFields.dateX = "date";
series.tooltipText = "Cumulative Abscence Days: {value}"
series.strokeWidth = 3;
series.name = "Cumulative Absence days";

// Create series
var series_ref = chart.series.push(new am4charts.LineSeries());
series_ref.dataFields.valueY = "limit";
series_ref.dataFields.dateX = "date";
series_ref.stroke = am4core.color("red");
series_ref.strokeDasharray = 3;
series_ref.strokeWidth = 3;
series_ref.name = "Cumulative Absence Limit";

chart.cursor = new am4charts.XYCursor();
chart.cursor.snapToSeries = series;
chart.cursor.xAxis = dateAxis;

chart.legend = new am4charts.Legend();

window.onload = update_dates();


