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
});
const Forsinkelse = mongoose.model("Forsinkelse", mappedCallsSchema);
let mappedCalls;
let stopPlaceId = "60944";

fetchData();
setInterval(fetchData, 60000);

function fetchData() {
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
          serviceJourney {
            line {
                id
            }
            id
          }
          quay {
              name
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
      //estimatedCalls = estimatedCalls.filter((i) => Math.round((((Date.parse(i.expectedArrivalTime) - Date.parse(i.aimedArrivalTime)) % 86400000) % 3600000) / 60000));
      mappedCalls = estimatedCalls.map((item) => {
        return {
          id: item.serviceJourney.id,
          line: item.serviceJourney.line.id.replace("RUT:Line:", "").replace("NSB:Line:", ""),
          aimedTime: Date.parse(item.aimedArrivalTime),
          expectedTime: Date.parse(item.expectedArrivalTime),
          name: item.quay.name,
          // timeDiff: expectedTime - aimedTime,
          // diffMin: Math.round(((timeDiff % 86400000) % 3600000) / 60000),
        };
      });
      mappedCalls.forEach((data) => {
        Forsinkelse.findOneAndUpdate({ id: data.id, aimedTime: data.aimedTime }, data, { upsert: true, new: true }, (err, existingData) => {});
      });
    })
    .catch((error) => console.error(error));
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
    query = { line: req.query.lineID };
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
