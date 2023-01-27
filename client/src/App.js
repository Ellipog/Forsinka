import "./App.css";
import React, { useState, useEffect } from "react";
import Forsinkelse from "./components/Forsinkelse";
import pako from "pako";

let count = 20;

function App() {
  const [forsinkelser, setForsinkelser] = useState([]);
  let [lineID, setLineID] = useState("");
  let [stopPlaceID, setStopPlaceID] = useState("60944");
  const lines = [
    {
      type: "Buss: ",
      line: "510",
    },
    {
      type: "Buss: ",
      line: "515",
    },
    {
      type: "Buss: ",
      line: "516",
    },
    {
      type: "Buss: ",
      line: "521",
    },
    {
      type: "Buss: ",
      line: "525",
    },
    {
      type: "Buss: ",
      line: "580",
    },
    {
      type: "Tog: ",
      line: "L2",
    },
    {
      type: "Tog: ",
      line: "L21",
    },
    {
      type: "Tog: ",
      line: "R20",
    },
  ];

  async function fetchData() {
    fetch(`https://forsinkasrv.chillcraft.co/forsinkelser?limit=${count}&lineID=${lineID}&stopPlaceID=${stopPlaceID}`, {
      method: "GET",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((compressed) => {
        let data = JSON.parse(pako.inflate(compressed, { to: "string" }));
        data = data.sort((a, b) => {
          return new Date(b.expectedTime) - new Date(a.expectedTime);
        });
        setForsinkelser(data);
      });
  }

  function handleLineIDChange(e) {
    count = 20;
    setLineID(e.target.value);
  }

  useEffect(() => {
    console.log(stopPlaceID + lineID);
    fetchData();
    count += 20;
  }, [lineID, stopPlaceID]);

  setTimeout(() => fetchData(), 60000);

  return (
    <div className="App">
      <div className="stopList">
        <button
          onClick={() => {
            count = 20;
            setStopPlaceID(60944);
          }}
        >
          Ski Stasjon
        </button>
        <button
          onClick={() => {
            count = 20;
            setStopPlaceID(4977);
          }}
        >
          Ski Næringspark
        </button>
      </div>
      <div className="header">
        <select className="select" value={lineID} onChange={(e) => handleLineIDChange(e)}>
          <option value="">Alle buss og tog</option>
          {lines.map((lines) => (
            <option key={lines.line} value={lines.line}>
              {lines.type + lines.line}
            </option>
          ))}
        </select>
      </div>{" "}
      {forsinkelser.map((forsinkelse, i) => {
        return <Forsinkelse key={i} line={forsinkelse.line} expectedTime={forsinkelse.expectedTime} aimedTime={forsinkelse.aimedTime} name={forsinkelse.name} />;
      })}{" "}
      <button className="showMore" onClick={() => fetchData()}>
        Vis mer...
      </button>
    </div>
  );
}

export default App;
