import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBus, faSubway } from "@fortawesome/free-solid-svg-icons";

function Forsinkelse(props) {
  return (
    <div className="forsinkelseBox">
      <div className="lineBox">
        {props.line.startsWith("L") || props.line.startsWith("R") ? <FontAwesomeIcon icon={faSubway}></FontAwesomeIcon> : <FontAwesomeIcon icon={faBus}></FontAwesomeIcon>}
        <span className="vehicleStop">{props.line} </span>
        <span>{props.name}</span>
      </div>
      <div className="textElems">
        <p className="expectedBox">
          Ankom stasjonen: {new Date(props.expectedTime).toTimeString().slice(0, 5) + " " + " " + " " + new Date(props.expectedTime).getDate() + "/" + (new Date(props.expectedTime).getMonth() + 1)}
        </p>
        <p className="diffBox">Forsinka med: {Math.ceil((((Date.parse(props.expectedTime) - Date.parse(props.aimedTime)) % 86400000) % 3600000) / 60000) + 1} min</p>
      </div>
    </div>
  );
}

export default Forsinkelse;
