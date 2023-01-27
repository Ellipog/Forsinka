import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import mongoose from "mongoose";
import pako from "pako";
const app = express();

const db = "mongodb+srv://ForsinkaAdmin:yrb7hKeNhX8Ndb8F@forsinka.mm354pn.mongodb.net/Forsinka";
mongoose.set("strictQuery", false);
mongoose.connect(db, {});
const mappedCallsSchema = new mongoose.Schema({
  id: String,
  line: String,
  aimedTime: Date,
  expectedTime: Date,
  name: String,
  stopPlace: String,
});
const Forsinkelse = mongoose.model("Forsinkelse", mappedCallsSchema);
let mappedCalls;
let stopPlaceIds = ["60944", "4977"];
// 60944 = Ski stasjon, 4977 = Ski Næringspark

fetchData();
setInterval(fetchData, 60000);

function fetchData() {
  for (const stopPlaceId of stopPlaceIds) {
    fetch("https://api.entur.io/journey-planner/v3/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ET-Client-Name": "your-client-name",
        "ET-Client-ID": "your-client-id",
      },
      body: JSON.stringify({
        variables: {},
        query: `
    query {
      stopPlace(id: "NSR:StopPlace:${stopPlaceId}") {
        name
        estimatedCalls(timeRange: 1000, numberOfDepartures: 70) {
          realtime
          aimedArrivalTime
          expectedArrivalTime
          destinationDisplay {
            frontText
          }
          serviceJourney {
            line {
                id
            }
            id
          }
        }
      }
    }
    `,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        let estimatedCalls = data.data.stopPlace.estimatedCalls;
        estimatedCalls = estimatedCalls.filter((i) => i.aimedArrivalTime != i.expectedArrivalTime);
        mappedCalls = estimatedCalls.map((item) => {
          return {
            id: item.serviceJourney.id,
            line: item.serviceJourney.line.id.replace("RUT:Line:", "").replace("NSB:Line:", ""),
            aimedTime: Date.parse(item.aimedArrivalTime),
            expectedTime: Date.parse(item.expectedArrivalTime),
            name: item.destinationDisplay.frontText,
            stopPlace: stopPlaceId,
          };
        });
        mappedCalls.forEach((data) => {
          Forsinkelse.findOneAndUpdate({ id: data.id, aimedTime: data.aimedTime }, data, { upsert: true, new: true }, (err, existingData) => {});
        });
      })
      .catch((error) => console.error(error));
  }
}

app.use(
  cors({
    origin: "https://forsinka.chillcraft.co",
    credentials: true,
  })
);

app.get("/forsinkelser", (req, res) => {
  let query = {};
  if (req.query.lineID) {
    query = { line: req.query.lineID, stopPlace: req.query.stopPlaceID };
  } else {
    query = { stopPlace: req.query.stopPlaceID };
  }
  let limit = req.query.limit ? parseInt(req.query.limit) : 0;
  Forsinkelse.find(query)
    .sort({ aimedTime: -1 })
    .limit(limit)
    .then((data) => {
      const compressed = pako.deflate(JSON.stringify(data));
      res.json(compressed);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).json({ message: "Error retrieving data from the database" });
    });
});

app.listen(25592, () => {
  console.log("listening on 25592");
});
