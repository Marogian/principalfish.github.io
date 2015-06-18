// fills out table of info at top of #right
var oldPartyClass = null;
var oldIncumbentClass = null;

var partyNameElement = "#information-party .party-name";
var partyFlairElement = "#information-party .party-flair";
var gainNameElement = "#information-gain .party-name";
var gainFlairElement = "#information-gain .party-flair";

var task_party_map = {
	"Labour" : "labour",
	"Conservative" : "conservative",
	"Lib-Dem" : "libdems",
	"Other" : "other"
};

function seatinfo(d){

	var seatInfo = seatData[d.properties.name]["seat_info"];

	$(partyFlairElement).removeClass(oldPartyClass);
  $(gainFlairElement).removeClass(oldIncumbentClass);
	$("#information-seatname-span").text(seatInfo["new_data"]["seat"] + " - " + seatInfo["new_data"]["code"]);
	$("#information-region").text("Region: " + regionlist[seatInfo["area"]]);

	$(partyNameElement).text("Party: " + partylist[seatInfo["winning_party"]]);
    $(partyFlairElement).addClass(seatInfo["winning_party"]);

	if (seatInfo["winning_party"] != seatInfo["incumbent"]) {
		$(gainNameElement).text("Gain from " + partylist[seatInfo["incumbent"]]);
        $(gainFlairElement).addClass(seatInfo["incumbent"]);
    }
	else {
		$(gainNameElement).text("");
    }

	$("#information-members").text("Members: " + seatInfo["new_data"]["members"]);

	$("#information-electorate").text("Electorate : " + seatInfo["new_data"]["Electorate"]);
	$("#information-turnout").text("Turnout : " + seatInfo["new_data"]["turnout"] );

	horizontalBarChart(d)

	// $("#information-social").text("Social Grades(%) - AB \xA0: " + seatInfo["new_data"]["ab"]
	// 																+ "\xA0\xA0 C1 : " + seatInfo["new_data"]["c1"]
	// 																+ "\xA0\xA0 C2 : " + seatInfo["new_data"]["c2"]
	// 																+ "\xA0\xA0 DE : " + seatInfo["new_data"]["de"]
	//
	// 															);

	$("#information-pie").html(piechart(d));

	oldPartyClass = seatInfo["winning_party"];
    oldIncumbentClass = seatInfo["incumbent"];
}

function horizontalBarChart(d){
	$("#information-social").empty();
	$("#information-social").html("<div id=\"social-grades\">Social Grades </div>")
	var ab = parseFloat(seatData[d.properties.name]["seat_info"].new_data.ab)
	var c1 = parseFloat(seatData[d.properties.name]["seat_info"].new_data.c1)
	var c2 = parseFloat(seatData[d.properties.name]["seat_info"].new_data.c2)
	var de = parseFloat(seatData[d.properties.name]["seat_info"].new_data.de)

	var data = {"AB" : ab, "C1" : c1, "C2" :  c2, "DE" :  de};
	var colours = ["#CD7F32", "#BB6528", "#79443B", "#4B3621"]
	var text_colours = ["white", "white", "white", "white"]


	var current_width = 85;

	var count = 0
	$.each(data, function(d, i){
		var x = current_width
		$("#social-grades").append("<div style=\" position: absolute; float: left; margin-left: 30px; background-color :"
										+ colours[count ] + "; color: "
										+ text_colours[count] + "; font-size: 0.70em; text-align: center; padding-top: 5px; width :"
										+ 6.5 * data[d] +
										"px; height: 15px; left : " + current_width + "px; top: 87px;\">" +
										d + ":" + i.toFixed(1) +  "%</div>");

		current_width +=  6.5  * data[d]
		count += 1
	});
}

function piechart(d){
	$("#information-pie").empty();
	$("#information-chart").empty();
	$("#information-chart").html("<table></table>");

	var data = [];
	var seatName = d.properties.name;
	var relevant_party_info = seatData[seatName]["party_info"];

	$.each(relevant_party_info, function(d){
		votes = parseInt(seatData[seatName]["seat_info"]["new_data"][d]);
		if (votes > 0){
			data.push({party: d, votes: votes});
		}
	})

	var filterdata = [];



	$.each(data, function(i){
		if (data[i].votes > 0 && data[i].party != "others" && data[i].party != "other")
			filterdata.push(data[i]);
	});


	filterdata.sort(function(a, b){
			return b.votes - a.votes;
	});


	filterdata.push({"party" : "other", "votes" : parseInt(seatData[seatName]["seat_info"]["new_data"]["other"])});


	var barchartdata = [];

	$.each(filterdata, function(i){
		if (filterdata[i].votes >= 1000){
			barchartdata.push(filterdata[i]);
		}
	});

	var dataitems = barchartdata.length
	var margin = {top: 10, right: 0, bottom: 10, left:47};

	var width = 250 - margin.left - margin.right;
	var height = 225 - margin.top - margin.bottom;
	var bargap = 2;
	var barwidth = d3.min([60, (width / dataitems) - bargap]);
	var animationdelay = 250;

	var svg1 = d3.select("#information-pie")
		.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
		.append("g")
    	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var x = d3.scale.ordinal().range([0, dataitems * (barwidth + 2)]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var y = d3.scale.linear()
		.range([height, 0])

	var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .ticks(6);

	var max_of_votes = d3.max(barchartdata, function(d) { return d.votes; })
	y.domain([0, d3.max([60, (max_of_votes + (10 - max_of_votes % 10))]) + 2000]);

	svg1.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

	svg1.append("g")
    .attr("class", "y axis")
    .call(yAxis);

	svg1.selectAll("rect")
		.data(barchartdata)
		.enter()
		.append("rect")
      .attr("x", function(d, i) { return bargap * (i + 1) + barwidth * (i); })
      .attr("width", barwidth)
			.attr("y", height)
      .attr("height", 0)
			.attr("class", function(d) { return d.party;})
		.transition()
      .delay(function(d, i) { return i * animationdelay / 2; })
      .duration(animationdelay)
      .attr("y", function(d) { return y(d.votes); })
      .attr("height", function(d) { return height - y(d.votes); });


	$.each(filterdata, function(i){

		if (parseFloat(filterdata[i].votes) > 0) {

			var to_add = "<tr><td><div class= \" party-flair " + filterdata[i].party + "\"></div><td style=\"max-width: 170px;\">" +
			partylist[filterdata[i].party] + "</td><td>" + (parseFloat(filterdata[i].votes)) +  "</td><tr>";
			}


		$("#information-chart table").append(to_add);
	})

	if (seatData[d.properties.name]["seat_info"]["byelection"] != null){
		$("#information-byelection").text("By-election since " + pageSetting.slice(0, 4));
	}
	else {
		$("#information-byelection").text("");
	}
}