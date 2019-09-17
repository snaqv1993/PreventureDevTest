const http = require('http');
const express = require('express');
const data = require('./dataset.json');
const convert = require('convert-seconds');


const app = express()


//Method to get information about a station
app.get('/station/:id', function(req, res) {
	try{
		fromStationID = Number(req.params.id);
		const stationName = data.find(d => d.from_station_id === fromStationID)
		if(stationName === null || stationName === undefined){
			res.setHeader('Content-Type', 'application/json');
			res.end(JSON.stringify({ "Error": fromStationID + " not found in the dataset"}));
			return;
		}

		const filteredArr = data.filter(d => d.from_station_id == fromStationID)

		let modeMap = {};
		let maxStationId = filteredArr[0].to_station_id, maxCount = 1;
		for(let i = 0; i < filteredArr.length; i++)
		{
			let stationId = filteredArr[i].to_station_id;
			if(modeMap[stationId] == null)
				modeMap[stationId] = 1;
			else
				modeMap[stationId]++;  
			if(modeMap[stationId] > maxCount)
			{
				maxStationId = stationId;
				maxCount = modeMap[stationId];
			}
		}	

		for(let i = 0; i < data.length; i++){
			if(data[i].to_station_id === maxStationId){
				mostPopularDestination = data[i];
				break;
			}

		}

		let ageArray = [["0 - 15"] , ["16 - 30"], ["31 - 45"], ["46+"]]

		filteredArr.map(d => {
			if(d.birthyear !== null){
				let age = 2019 - d.birthyear
				if(age < 16){
					ageArray[0].push(age)
				}
				else if(age >= 16 && age <= 30){
					ageArray[1].push(age)
				}
				else if(age >= 31 && age <= 45){
					ageArray[2].push(age)
				}
				else{
					ageArray[3].push(age)
				}
			}
		})

		let biggestAgeGroup = ageArray[0];
		ageArray.map(arr => {
			if(arr.length > biggestAgeGroup.length)
				biggestAgeGroup = arr
		});


		const totalRevenue = filteredArr.reduce((acc, curr) => {
			return acc + Number.parseFloat(curr.tripduration.replace(/,/g, ''));
		}, 0.00);

		responseToSend = {};
		responseToSend["StationID"] = fromStationID;
		responseToSend["StationName"] = stationName.from_station_name;
		responseToSend["MostPopularDestionation"] = {
			"StationID" : mostPopularDestination.to_station_id,
			"StationName" : mostPopularDestination.to_station_name
		}
		responseToSend["PrevalentAgeGroup"] = {};
		responseToSend["PrevalentAgeGroup"]["AgeGroup"] = biggestAgeGroup[0];
		biggestAgeGroup.shift();
		responseToSend["PrevalentAgeGroup"]["CustomerAges"] = biggestAgeGroup;
		let timeObject = convert(totalRevenue)
		responseToSend["TotalRevenue"] = "$" + Number.parseFloat((timeObject.hours * 60 * 0.10) + (timeObject.minutes * 0.10) + ((timeObject.seconds / 60) * 0.10)).toFixed(2)
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({ "StationStats": responseToSend }));
	}
	catch(e){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({ "Error": "Something went wrong" }));
	}
}
)


//Method to get top earning stations
app.get('/topstations', function (req, res) {
	try{
		const stations = new Set(data.map(d => {
			return d.from_station_name
		}));

		var stationsAndTime = [];
		for(let item of stations){
			let arr4 = data.filter(d => d.from_station_name === item).reduce((acc, curr) => {
				return acc + Number.parseFloat(curr.tripduration.replace(/,/g, ''));
			}, 0.00)
			stationsAndTime.push([item, arr4]);
		}

		stationsAndTime.sort((a, b) => {
			return b[1] - a[1];
		})

		let responseToSend = {};
		for(let i = 0; i < 3; i++){
			let revenue = (stationsAndTime[i][1] / 60) * 0.10;
			responseToSend[stationsAndTime[i][0]] = "$" + Number.parseFloat(revenue).toFixed(2);
		}

		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({ "TopRevenueGeneratingStations": responseToSend }));
	}
	catch(e){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({ "Error": "Something went wrong" }));
	}
})



//Method to get bikes that need repair
app.get('/repairbikes', function (req, res) {
	try{
		let bikesNeedingRepairs = [];

		const bikes = [...new Set(data.map(d => d.bikeid))];
		var bikesAndTime = [];
		for(let item of bikes){
			let arr4 = data.filter(d => d.bikeid === item).reduce((acc, curr) => {
				return acc + parseFloat(curr.tripduration.replace(/,/g, ''));
			}, 0)
			bikesAndTime.push([item, arr4]);
		}

		let responseToSend = []
		for(let i = 0; i < bikesAndTime.length; i++){
			if(bikesAndTime[i][1] / 60 > 1000)
				responseToSend.push(bikesAndTime[i][0]);
		}

		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({ "BikesNeedingRepairs": responseToSend }));
	}
	catch(e){
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({ "Error": "Something went wrong" }));
	}
})

app.listen(3000, function(){
	console.log("i am running")
});

