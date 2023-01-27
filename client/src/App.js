import "./App.css";
import React, { useState, useEffect } from "react";
import Forsinkelse from "./components/Forsinkelse";
import pako from "pako";

let count = 20;

function App() {
  const [forsinkelser, setForsinkelser] = useState([]);
  let [lineID, setLineID] = useState("");
  const lines = ["510", "515", "516", "520", "521", "525", "580", "L2", "L21", "R20"];

  async function fetchData() {
    fetch(`https://forsinkasrv.chillcraft.co/forsinkelser?limit=${count}&lineID=${lineID}`, {
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
        count += 20;
      });
  }

  function handleLineIDChange(e) {
    count = 20;
    setLineID(e.target.value);
  }

  useEffect(() => {
    fetchData();
  }, [lineID]);

  setTimeout(() => fetchData(), 60000);

  return (
    <div className="App">
      <div className="header">
        <select className="select" value={lineID} onChange={(e) => handleLineIDChange(e)}>
          <option value="">Alle linjer</option>
          {lines.map((line) => (
            <option key={line} value={line}>
              {line}
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
