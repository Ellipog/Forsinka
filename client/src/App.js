import "./App.css";
import React, { useState, useEffect } from "react";
import Forsinkelse from "./components/Forsinkelse";
import pako from "pako";

let count = 20;

function App() {
  const [forsinkelser, setForsinkelser] = useState([]);

  async function test() {
    fetch(`https://forsinkasrv.chillcraft.co/forsinkelser?limit=${count}`, {
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
          return new Date(b.aimedTime) - new Date(a.aimedTime);
        });
        setForsinkelser(data);
        count += 20;
      });
  }

  useEffect(() => {
    test();
  }, []);

  return (
    <div className="App">
      <div className="header">
        <input className="search" type="text" placeholder="Søk..."></input>
      </div>{" "}
      {forsinkelser.map((forsinkelse, i) => {
        return <Forsinkelse key={i} line={forsinkelse.line} expectedTime={forsinkelse.expectedTime} aimedTime={forsinkelse.aimedTime} name={forsinkelse.name} />;
      })}{" "}
      <button className="showMore" onClick={() => test()}>
        Vis mer...
      </button>
    </div>
  );
}

export default App;
