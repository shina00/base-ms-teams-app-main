import { app } from "@microsoft/teams-js";
import { AzureFunctions } from "./AzureFunctions";
import { useContext,useState,useEffect } from "react";
import { useData } from "@microsoft/teamsfx-react";
import { TeamsFxContext } from "../Context";
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as microsoftTeams from "@microsoft/teams-js";
import { BrowserRouter as Router, Switch, Route, Link, useNavigate } from 'react-router-dom';
require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');

export default function Navigate() {
  
    
   
    return(
        <div className="container">
  
        <div>
         
         
        </div>
       <a href="/Groups">
      <div className="card1">
               <img src={require('./Images/logos_microsoft-teams.png')} ></img>
        <div className="card-text">
          {/* <h3>{teamsApiData.length}</h3> */}
          <p>Teams</p>
        </div>
      </div>
      </a>
      <div className="card2">
               <img src={require('./Images/microsoftlogo.png')} ></img>
       <div className="card-text">
          <h3>21</h3>
          <p>Work</p>
        </div>  </div>
      <div className="card3">
               <img src={require('./Images/yammerlogo.png')} ></img>
       <div className="card-text">
          <h3>12</h3>
          <p>Spaces</p>
        </div>  </div>
        <Link to="/" >
      <div className="card4">
               <img src={require('./Images/sharepointlogo.png')} ></img>
       <div className="card-text">   
        {/* <h3>  {siteApiData.length}</h3> */}
          
          <p>Sites</p>
       </div></div>
       </Link>
      <div className="card5">
               <img src={require('./Images/user-add.png')} ></img>
       <div className="card-text">
          <h3>26</h3>
          <p>Owners</p>
        </div>  </div>
      <div className="card6">
               <img src={require('./Images/protectionicon.png')} ></img>
       <div className="card-text">
          <h3>11</h3>
          <p>Protected</p>
        </div>  </div>
         
      <div className="card7">
               <img src={require('./Images/interneticon.png')} ></img>
       <div className="card-text">
          <h3>21</h3>
          <p>External</p>
        </div> 
         </div>
        
        <Link to="/groups"  >
      <div className="card8">
        <img src={require('./Images/officeicon.png')} ></img>
      <div className="card-text">
          {/* <h3>{internalApiData.length}</h3> */}
          <p>Groups</p>
        </div>
       
      </div>
      </Link>
      </div>
    )
}