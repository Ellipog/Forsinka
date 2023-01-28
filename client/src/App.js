import "./App.css";
import React, { useState, useEffect } from "react";
import Forsinkelse from "./components/Forsinkelse";
import pako from "pako";
import classNames from "classNames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSchool, faBuilding } from "@fortawesome/free-solid-svg-icons";

let count = 20;

function App() {
  const [forsinkelser, setForsinkelser] = useState([]);
  let [lineID, setLineID] = useState("");
  let [stopPlaceID, setStopPlaceID] = useState("60944");
  const [activeFooterButton, setActiveFooterButton] = useState("60944");
  const [prevStopPlaceID, setPrevStopPlaceID] = useState(stopPlaceID);
  const ssLines = [
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
  const snLines = [
    {
      type: "Buss: ",
      line: "515",
    },
    {
      type: "Buss: ",
      line: "520",
    },
  ];
  const [lines, setLines] = useState(ssLines);
  const linesMapping = {
    60944: ssLines,
    4977: snLines,
  };

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

  function fetchMoreData() {
    count += 20;
    fetchData();
  }

  useEffect(() => {
    setPrevStopPlaceID(stopPlaceID);
  }, [stopPlaceID]);

  useEffect(() => {
    count = 20;
    fetchData();
  }, [lineID, stopPlaceID]);

  setTimeout(() => fetchData(), 60000);

  return (
    <div className="App">
      <div className="header">
        <select
          className={classNames("select", "selectStopPlace")}
          value={stopPlaceID}
          onChange={(e) => {
            setStopPlaceID(e.target.value);
            setLines(linesMapping[e.target.value]);
            setLineID("");
          }}
        >
          <option value="60944">Ski Stasjon</option>
          <option value="4977">Ski Næringspark</option>
        </select>
        <select className="select" value={lineID} onChange={(e) => setLineID(e.target.value)}>
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
      <button className="showMore" onClick={() => fetchMoreData()}>
        Vis mer...
      </button>
      <div className="footer">
        <button
          className={`footerButton ${activeFooterButton === "60944" ? "activeFooterButton" : ""}`}
          onClick={() => {
            setLines(ssLines);
            setStopPlaceID("60944");
            setLineID("");
            setActiveFooterButton("60944");
          }}
        >
          <div className="footerIcon">
            <FontAwesomeIcon icon={faBuilding} />
          </div>
          Ski Stasjon
        </button>
        <button
          className={`footerButton ${activeFooterButton === "4977" ? "activeFooterButton" : ""}`}
          onClick={() => {
            setLines(snLines);
            setStopPlaceID("4977");
            setLineID("");
            setActiveFooterButton("4977");
          }}
        >
          <div className="footerIcon">
            <FontAwesomeIcon icon={faSchool} />
          </div>
          Ski Næringspark
        </button>
      </div>
    </div>
  );
}

export default App;
