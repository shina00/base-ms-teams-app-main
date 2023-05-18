import { useContext,useState,useEffect } from "react";
import { Image } from "@fluentui/react-northstar";
import "./Welcome.css";
import { Dropdown, Loader } from '@fluentui/react-northstar'
import { app } from "@microsoft/teams-js";
import { AzureFunctions } from "./AzureFunctions";
import { useData } from "@microsoft/teamsfx-react";
import { TeamsFxContext } from "../Context";
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as microsoftTeams from "@microsoft/teams-js";
import SlidingPanel from 'react-sliding-side-panel';
import { toasterErrorMessage } from "../utils/errorHandlingUtils";
import { LineChart } from '@fluentui/react-charting';
import {UserData} from '../Data';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend,} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
//import faker from 'faker';

import Group from "./Groups";
require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');

//import { Client } from "@microsoft/microsoft-graph-client";
//import { GraphUserProfile, IGraphUserProfile } from "./IGraphUserProfile";

export function Welcome(props) {
  const { environment, triggerConsent, apiClient, loggedInUser } = {
    environment: window.location.hostname === "localhost" ? "local" : "azure",
    ...props,
  };
  const friendlyEnvironmentName =
    {
      local: "local environment",
      azure: "Azure environment",
    }[environment] || "local environment";

  const { teamsUserCredential } = useContext(TeamsFxContext);
  const { loading, data, error } = useData(async () => {
    if (teamsUserCredential) {
      const userInfo = await teamsUserCredential.getUserInfo();
      return userInfo;
    }
  });
  const userName = (loading || error) ? "" : data.displayName;
  const hubName = useData(async () => {
    await app.initialize();
    const context = await app.getContext();
    return context.app.host.name;
  })?.data;

  //Analytics
  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  const options = {
    scales: {
      xAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Month'
        }
      }],
      yAxes: [{
        scaleLabel: {
          display: true,
          labelString: 'Value'
        }
      }]
    }
  };
  
 
  
 

    // Get analytics data for logged in user
    useData(async () => {
      console.log('...',loggedInUser.preferredUserName)
      await getAnalyticsData(loggedInUser.preferredUserName);
  });
  const [dropdownData, setDropDownData] = useState();
  const [apiData, setApiData] = useState(undefined);
  const [isClicked, setIsClicked] = useState(false);
  const { loader } = useData(async () => {
    try {
        const response = await apiClient.get("users");

        let processedData = response.data.map((user) => {
            return { header: user.userPrincipalName, content: user.displayName }
        });
        processedData = [{ header: "All", content: "All Users" }, ...processedData]
        setDropDownData(processedData)
    } catch (error) {
        let errorMessage = error.response.data.error;
        if (errorMessage.includes("invalid_grant")) {
            triggerConsent(true);
        } else {
            toasterErrorMessage("An error occured!");
        }
    }
});

//handle analytics change for all user 
const handleChange = async (event) => {
  setIsClicked(true);
  setApiData();
  try {
      const response = await apiClient.get(`analytics?userUpn=${event.value.header}`);
      setIsClicked(false);
      setApiData(response.data);
      
      // Implementation: step 2
      setSharepointData(restructureData(response.data.sharepoint, ["Shared Internally File Count", "Shared Externally File Count", "Viewed Or Edited File Count", "Visited Page Count"]));
  } catch (error) {
      setIsClicked(false);
      let errorMessage = error.response.data.error;
      if (errorMessage.includes("invalid_grant")) {
          triggerConsent(true);
      } else {
          toasterErrorMessage("Failed to retrieve your Microsoft 365 data");
      }
  }
}


   // analytics Implementation: step 1 (nothing)
   function restructureData(data, columns) {
    let testData = [];
    let count = 1;
    for (let column in data) {
        if (columns.includes(column)) {
            testData.push({ id: count, label: column, count: data[column] });
            count++;
        }
    }
    console.log("testdata...",testData)
    return testData;
}


 // analytics Implementation: step 2 (nothing)
 const [sharepointData, setSharepointData] = useState([]);
const getAnalyticsData = async (user) => {
  try {
      const response = await apiClient.get(`sharepointanalytics?userUpn=${user}`);
console.log('testresponse', response.data)
     // setApiData(response.data);     
      // Implementation: step 2
      setSharepointData(restructureData(response.data, ["Shared Internally File Count", "Shared Externally File Count", "Viewed Or Edited File Count", "Visited Page Count"]));
  } catch (error) {
      let errorMessage = error.response.data.error;
      if (errorMessage.includes("invalid_grant")) {
          triggerConsent(true);
      } else {
          toasterErrorMessage("An error occured!");
      }
  }
}
//step 3
function restructureDataForChart(userData, chartLabel) {
  const xLabels = ['Jan', 'Feb', 'Mar', 'Apr'];
  return {
    labels: userData.map((data) => data.label),
    datasets: [
      {
        labels: xLabels,
        label: chartLabel,
        data: userData.map((data) => data.count),
        backgroundColor: [
          "	rgba(0,112,192,1.000)",
          "rgb(54, 162, 235)",
          "rgb(255, 159, 64)",
          "rgb(172, 215, 250)",
          "#FF0000",
        ],
        borderColor: "black",
        borderWidth: 2,
      }
    ]
  }
}

 // Implementation: step 4
 const sharepointChartData = restructureDataForChart(sharepointData, "Sharepoint");

//create sharepoint site
  const [postApiData, setPostApiData] = useState([]);
  const [description, setDescription] = useState('');
const [displayName, setDisplayName] = useState('');
const [security, setSecurity] = useState('');

  const HandleCreate = async (e) => {
    e.preventDefault();
     let body = {
      description: description,
      displayName: displayName,
      security: security
    }
    let response = await apiClient.post("postGroup", body);
    setPostApiData(response.data.value);
    setShowFirstPane(false)
    setShowSecondPane(false)
    setShowThirdPane(false)
    setshowLastPane(false)
    console.log('posttesting' , response.data)
   };

   //create Team
   const [postTeamsApiData, setPostTeamApiData] = useState([]);
   const [teamDescription, setTeamDescription] = useState('');
   const [teamDisplayName, setTeamDisplayName] = useState('');
   const HandleCreateTeams = async (e) => {
    setShowFirstPane(false)
    setShowSecondPane(false)
    setShowThirdPane(false)
    setshowLastPane(false)
    setshowTeamsPane(false)
    e.preventDefault();
     let body = {
      description: teamDescription,
      displayName: teamDisplayName,
    }
    let response = await apiClient.post("postTeams", body);
    setPostTeamApiData(response.data.value);
   
    console.log('postteamtesting' , response.data)
   };
//   useData(async () => {
//     let body = {
//       description: description,
//       displayName: displayName,
//     }
//     let response = await apiClient.post("postGroup", body);
//     setPostApiData(response.data.value);
//     console.log('posttesting' , response.data)
// });


      
   // test
   const [welcomeApiData, setWelcomeApiData] = useState(); 

//get sitedata with rest
//  const [restsiteApiData, setrestSiteApiData] = useState([]);
//       useData(async () => {
//          let response = await apiClient.get("restSite");
//          setrestSiteApiData(response.data.value);
//          console.log('restsitetesting' , response.data)
//     });
   
// get sharepoint site data
const [siteApiData, setSiteApiData] = useState([]);
      useData(async () => {
        let response = await apiClient.get("site");
        setSiteApiData(response.data.value);
        console.log('sitetesting' , response.data)
   });

   // get sharepoint restsite data
const [restsiteApiData, setRestSiteApiData] = useState([]);
useData(async () => {
  let response = await apiClient.get("sharepointrest");
  setRestSiteApiData(response.data.value);
  console.log('sitetesting' , response.data)
});

   const [siteanalyticsData, setanalyticsApiData] = useState([]);
      useData(async () => {
        let response = await apiClient.get("sharepointanalytics");
        setanalyticsApiData(response.data);
        console.log('siteanalytics' , response.data)
   });

   //get sharepoint user report
   const [siteReportData, setReportApiData] = useState([]);
      useData(async () => {
        let response = await apiClient.get("reports");
        setReportApiData(response.data.value);
        console.log('sitereporttesting' , response.data);
        console.log("details")
   });

   //get sharepoint pages report
   const [allsiteData, setallSiteApiData] = useState([]);
   useData(async () => {
     let response = await apiClient.get("sharepoint");
     setallSiteApiData(response.data.value);
     console.log('allsitetesting' , response.data)
});

   // get group site data
   const [internalApiData, setInternalApiData] = useState([]);
   const [groupsecurityData, setgroupsecurityData] = useState([]);
    useData(async () => {
        let response = await apiClient.get("user");
        setInternalApiData(response.data.value);
        console.log('testing' , response.data)
    });

//get teams api data
    const [teamsApiData, setTeamsApiData] = useState([]);
    useData(async () => {
      let response = await apiClient.get("teams");
      setTeamsApiData(response.data.value);
      console.log('testingteams' , response.data)
  });

  //get owners api data
  const [ownersApiData, setownersApiData] = useState([]);
  useData(async () => {
    let response = await apiClient.get("owners");
    setownersApiData(response.data.value);
    console.log('testingowners' , response.data)
});

//get members api data
const [membersApiData, setmembersApiData] = useState([]);
useData(async () => {
  let response = await apiClient.get("owners");
  setmembersApiData(response.data.value);
  console.log('testingmembers' , response.data)
});


  //handle data change on click
  const [showGroup, setShowGroup] = useState(false);
  const [showSite,setShowSite] = useState(false)
  const [showTeams, setShowTeams] = useState(false);
  const [showDefault, setShowDefault] = useState(true);

  const handleGroupClick = () => {
    setShowGroup(true);
    setShowSite(false);
    setShowTeams(false);
    setShowDefault(false);

  };

  const handleSiteClick = () => {
    setShowSite(true);
    setShowGroup(false);
    setShowTeams(false);
    setShowDefault(false);

  };

  const handleTeamsClick = () => {
    setShowTeams(true);
    setShowGroup(false);
    setShowSite(false);
    setShowDefault(false);
  };

  //handle panel
    const [selectedMenuItem, setSelectedMenuItem] = useState("local");
    // const items = steps.map((step) => {
    //   return {
    //     key: step,
    //     content: friendlyStepsName[step] || "",
    //     onClick: () => setSelectedMenuItem(step),
    //   };
    // });
    const [showFirstPane, setShowFirstPane] = useState(false);
    const [showSecondPane,setShowSecondPane] = useState(false)
    const [showLastPane, setshowLastPane] = useState(false);
    const [showAnalyticsPane, setshowAnalyticsPane] = useState(false);
    const [showAllAnalyticsPane, setshowAllAnalyticsPane] = useState(false);
    const [showTeamsPane, setshowTeamsPane] = useState(false);
  
    const closePage = () => {
      setShowFirstPane(false)
      setShowSecondPane(false)
      setShowThirdPane(false)
      setshowLastPane(false)
      setshowTeamsPane(false)
      setshowAnalyticsPane(false);
      setshowAllAnalyticsPane(false);
    }
  
    const handleButtonClick = () => {
      setshowLastPane(!showLastPane);
    };
    const handleThirdClick = () => {
      setShowSecondPane(!showSecondPane)
      setShowThirdPane(!showThirdPane)
  };
    const [showThirdPane, setShowThirdPane] = useState(false);
  
    const handleFirstButtonClick = () => {
      setShowSecondPane(!showSecondPane);
      setShowFirstPane(!showFirstPane);
  
    };
  // const handleSecondPageBackClick = () =>{
  //   setShowSecondPane(!showSecondPane);
  
  // }
  
    const handleThirdButtonClick = () => {
      setShowFirstPane(!showFirstPane);
    };

    const handleAnalyticsClick = () => {
      setshowAnalyticsPane(!showAnalyticsPane);
    };

    const handleAllAnalyticsClick = () => {
      setshowAnalyticsPane(!showAnalyticsPane);
    };

    const handleTeamsPaneClick = () => {
      setshowTeamsPane(!showTeamsPane);
      setShowFirstPane(false)
    };
   
   
   
    
  
  return (
    <>
    {showFirstPane && (
       
        <>
                  <div style={{ width: '500px',overflowY:"scroll", height: '100%', backgroundColor: '#eeeeee', position: 'fixed', top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
                        <h6><b>New Workspace Request</b></h6>
                        <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>
                        <div>
                          <h4>Welcome {userName ? ", " + userName : ""}</h4>
                          <p>Let's start by selecting a workspace type for this request...  </p>


                          <div className="workspace-grid">

                            <div className="workspace-card">
                             <a onClick={handleTeamsPaneClick}>
                               <div style={{display:"flex",alignItems:"center"}}>
                                <img src={require('./Images/logos_microsoft-teams.png')} ></img>
                                  <h5 style={{marginLeft:"10px"}}><b>Microsoft Team</b></h5>
                              </div>
                              <div>
                                <ul className="workspace-ul">
                                  <li>Meeting,chat,channels and topics</li>
                                  <li>Simplified Guest Access And External Sharing</li>
                                  <li>Automatic Protection Of Sensitive Information</li>
                                  <li>Integrated Document Collaboration</li>
                                </ul>
                              </div>
                             </a>
                           </div>

                            <div className="workspace-card" onClick={handleFirstButtonClick} style={{cursor:"pointer"}}>
                            <div>
                              <div style={{display:"flex",alignItems:"center"}}>
                                <img src={require('./Images/sharepointlogo.png')} ></img>
                                  <h5 style={{marginLeft:"10px"}}><b>SharePoint Online</b></h5>
                              </div>
                              <div>
                                <ul className="workspace-ul">
                                  <li>Share Documents Internally or Externally</li>
                                  <li>Publish Authoritative Content</li>
                                  <li>Protect Sensitive Content While Sharing</li>
                                  <li>Send Targeted Communications</li>
                                </ul>
                              </div>
                            </div>
                           </div>

                            <div className="workspace-card">
                            <a href="">
                              <div style={{display:"flex",alignItems:"center"}}>
                                <img src={require('./Images/yammerlogo.png')} ></img>
                                  <h5 style={{marginLeft:"10px"}}><b>Yammer Community</b></h5>
                              </div>
                              <div>
                                <ul className="workspace-ul">
                                  <li>Connect With Colleagues On Topics</li>
                                  <li>Post Company Wide Announcements</li>
                                  <li>Encourage Cross-Department Discussions</li>
                                  <li>Create Knowledge Sharing Networks</li>
                                </ul>
                              </div>
                            </a>
                           </div>

                            <div className="workspace-card">
                            <a href="">
                              <div style={{display:"flex",alignItems:"center"}}>
                                <img src={require('./Images/officeicon.png')} ></img>
                                  <h5 style={{marginLeft:"10px"}}><b>Secure Collaboration</b></h5>
                              </div>
                              <div>
                                <ul className="workspace-ul">
                                  <li>Secure Internal Or External Sharing With Content Protection</li>
                                  <li>Used For Financial Transfers,Mergers And Acquisitions,Fundraisongs,IPO,Strategic Partnerships Or Board Communications</li>
                                  <li>Intellectual Property Protection With Productivity</li>
                                </ul>
                              </div>
                            </a>
                           </div>

                        </div>



                        </div>
                  </div>
        </>
      )
    }

{
showSecondPane && (
  <div style={{ width: '500px', height: '100%',overflowY:"Scroll", backgroundColor: '#eeeeee', position: 'fixed', top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
  <h6><b>New Workspace Request</b></h6>
  <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>
  <div>
    <h3>Welcome {userName ? ", " + userName : ""}</h3>
    <p>Let's start by selecting a workspace type for this request...  </p>


    <div className="workspace-grid">

      {/* <div className="workspace-card">
       <a href="">
         <div style={{display:"flex",alignItems:"center"}}>
          <img src={require('./Images/logos_microsoft-teams.png')} ></img>
            <h5 style={{marginLeft:"10px"}}><b>Secure Collaboration Team</b></h5>
        </div>
        <div>
            <p style={{marginTop:"11px",fontSize:"13px"}}>Productively work with teams and colleagues using chats,channels and advanced apps and document management features</p>
        </div>
       </a>
     </div> */}

      <div className="workspace-card">
      <div>
        <div style={{display:"flex",alignItems:"center"}}>
          <img style={{width:"33px"}} src={require('./Images/image_151-removebg-preview (1) 1.png')} ></img>
            <h5 style={{marginLeft:"10px"}}><b>External Secure Collaboration</b></h5>
        </div>
        <div>
            <p style={{marginTop:"11px",fontSize:"13px"}}>Protected external collaboration with vendors,partners and other external groups</p>
        </div>
      </div>
     </div>

      <div className="workspace-card">
      <a onClick={handleThirdClick}>
        <div style={{display:"flex",alignItems:"center"}}>
          <img style={{width:"33px"}} src={require('./Images/image_151-removebg-preview (1) 1.png')} ></img>
            <h5 style={{marginLeft:"10px"}}><b>Internal Secure Collaboration</b></h5>
        </div>
        <div>
          <p style={{marginTop:"11px",fontSize:"13px"}}>Create sites to share information and documents with colleagues,partners and customers with rich co-authoring and change tracking features</p>
        </div>
      </a>
     </div>

      <div className="workspace-card">
      <a href="">
        <div style={{display:"flex",alignItems:"center"}}>
          <img style={{width:"33px"}} src={require('./Images/image_151-removebg-preview (1) 1.png')} ></img>
            <h5 style={{marginLeft:"10px"}}><b>Virtual Data Room (VDR)</b></h5>
        </div>
        <div>
          <p style={{marginTop:"11px",fontSize:"13px"}}>Protected external collaboration with vendors,partners and other external groups</p>
        </div>
      </a>
     </div>

  </div>
  </div>
  <div style={{display:"flex",justifyContent:"flex-end", marginTop:'15px',marginRight:"19px",position:"relative",left:"20px"}}>
           <button onClick={handleFirstButtonClick} className="btn btn-primary" style={{width:'80px',fontSize:'12px', marginRight:'10px', border:'solid 1px #444791' ,color:'#444791' ,backgroundColor:'#eeeeee'}}>Back</button>
           <button onClick={handleThirdButtonClick} className="btn btn-primary" style={{width:'80px',fontSize:'12px',marginRight:'10px',backgroundColor:'#444791'}}>Next</button>
           <button onClick={closePage} className="btn btn-primary" style={{width:'80px',fontSize:'12px', border:'solid 1px #444791' ,color:'#444791' ,backgroundColor:'#eeeeee'}}>Close</button>

        </div>
</div>
)
}

   {showThirdPane && (
      <div style={{ width: '400px', height: '100%', backgroundColor: '#eeeeee',overflowY:"scroll", position: 'fixed', top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
        {/* Content of the right side pane */}
        <div>
          <p style={{fontSize:'10px',color:'grey',fontWeight:'600'}}>New workspace request</p>
          <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>

        </div>
        <div>
          <h5>Protection</h5>
          <p style={{fontSize:'10px',fontWeight:'600'}}>Now let's keep your content safe and secure</p>
         <img src={require('./Images/Protection.png')}></img>
          </div>
      <div>
        <p><b>Automatic Document Protection</b> automatically protects your sensitive contents without :</p>
        <ul>
          <li style={{marginBlock:"15px"}}>Any added clicks or steps</li>
          <li style={{marginBlock:"15px"}}>Worrying about data theft or loss</li>
          <li style={{marginBlock:"15px"}}>Your having to manage protection seperately from workspace membership </li>
        </ul>
      </div>
      
      <div>
      <h5>Enable/Disable Protection*</h5>
      </div>

      <div style={{ fontSize: "14px" }}>
    <label style={{ display: "inline-flex", alignItems: "center",whiteSpace:"nowrap",marginBlock:"5px"}}>
      <input type="radio" name="document-protection" value="yes" style={{ marginRight: "10px",position:"relative" }} />
      Yes, enable automatic document protection
    </label>
    <label style={{ display: "inline-flex", alignItems: "center",whiteSpace:"nowrap",marginBlock:"5px"}}>
      <input type="radio" name="document-protection" value="no" style={{ marginRight: "10px",position:"relative" }} />
      No, nothing sensitive will be saved or shared
    </label>
  </div>
    
       <div style={{display:"flex",justifyContent:"flex-end", marginTop:'10px',marginRight:"19px"}}>
           <button onClick={handleThirdButtonClick } className="btn btn-primary" style={{width:'80px',fontSize:'12px', marginRight:'10px', border:'solid 1px #444791' ,color:'#444791' ,backgroundColor:'#eeeeee'}}>Back</button>
           <button onClick={handleThirdButtonClick && handleButtonClick} className="btn btn-primary" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791'}}>Next</button>
        </div>
       
      </div>
    )}

  {showLastPane && (
      <div style={{ width: '400px', height: '100%', backgroundColor: '#eeeeee', position: 'fixed',overflowY:"scroll", top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
        {/* Content of the right side pane */}
        <div>
          <p style={{fontSize:'10px',color:'grey',fontWeight:'600'}}>New workspace request</p>
          <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>

        </div>
        <div>
          <h5>Virtual Data Room (VDR), got it</h5>
          <p style={{fontSize:'10px',fontWeight:'600'}}>Lets collect some final details in order to fulfill your requests</p>
        </div>
        <form>
        <label for="fname">Selected Template</label>
  <input type="text"  className="formlabel" placeholder="Virtual Data Room (VDR)"></input>
  <label for="fname" >Give your site a title*</label>
  <input type="text" placeholder="Enter site name" className="formlabel" name="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
  <label for="fname">Give the site a description *</label>
  <input type="text" placeholder="Enter a description" className="formlabel" name="description" value={description} onChange={(e) => setDescription(e.target.value)} />
  <label for="fname">Enable Security</label>
  <input class="custom-select" id="inputGroupSelect01" value={security} onChange={(e) => setSecurity(e.target.value)} />
    {/* <option selected value="1">true</option>
    <option value="2">false</option> */}
  
  <label for="fname">Requested site URL</label>
  <input type="text"  placeholder="Enter requested site URL"className="formlabel"></input>
  <label for="fname">Privacy*</label>
  <input type="text"  placeholder="Private" className="formlabel"></input>
  <label for="fname">Site Collection Type*</label>
  <input type="text"  placeholder="Modern Team Site" className="formlabel"></input>
  <label for="fname">Primary Owner*</label>
  <input type="text"  placeholder="Modern Team Site" className="formlabel"></input>
  <label for="fname">Secondary Owner*</label>
  <input type="text"  placeholder="Modern Team Site" className="formlabel"></input>
  <label for="fname">New Protection Label*</label>
  <input type="text"  placeholder="Modern Team Site"></input>
  <div style={{display:"flex",justifyContent:"flex-end", marginTop:'10px'}}>
  <button onClick={handleButtonClick} className="btn btn-primary" style={{width:'80px',fontSize:'12px', marginRight:'10px', border:'solid 1px #444791' ,color:'#444791' ,backgroundColor:'#eeeeee'}}>Back</button>
  <button type='submit' onClick={HandleCreate} className="btn btn-primary" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791'}}>Submit</button>
  </div>
        </form>

      </div>
    )}

{showTeamsPane && (
      <div style={{ width: '400px', height: '100%', backgroundColor: '#eeeeee', position: 'fixed', top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
        {/* Content of the right side pane */}
        <div>
          <p style={{fontSize:'10px',color:'grey',fontWeight:'600'}}>New workspace request</p>
          <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>

        </div>
        <div>
          <h5>Create a Team on Teams, got it !</h5>
          <p style={{fontSize:'10px',fontWeight:'600'}}>Lets collect some final details in order to fulfill your requests</p>
        </div>
    
        <form>
        <label for="fname"> Display Name</label>
  <input type="text"  className="formlabel" placeholder="Display Name"value={teamDisplayName} onChange={(e) => setTeamDisplayName(e.target.value)}></input>
  <label for="fname" >Give the Team a Description</label>
  <textarea type="text" placeholder="Enter a description" rows="3" className="form-control" name="description"value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)}/>

  <div style={{display:"flex",justifyContent:"flex-end", marginTop:'10px'}}>
  <button onClick={handleButtonClick} className="btn btn-primary" style={{width:'80px',fontSize:'12px', marginRight:'10px', border:'solid 1px #444791' ,color:'#444791' ,backgroundColor:'#eeeeee'}}>Back</button>
  <button type='submit' onClick={HandleCreateTeams} className="btn btn-primary" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791'}}>Submit</button>
  </div>
        </form>

      </div>
    )}


{showAnalyticsPane && (
      <div style={{ width: '400px', height: '100%', backgroundColor: '#eeeeee', position: 'fixed',overflowY:"scroll", top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
        {/* Content of the right side pane */}
        <div>
         
          <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>

        </div>
        <div>
          <h5 style={{fontWeight:'800px', fontSize:"14px", color:"#444791"}}><b>Compliance 360 Projects Analytics</b></h5>
        </div>
        <div className="mt-4">
        <form >
        {/* <label for="fname">User</label>
        <div class="input-group mb-3">
  <select class="custom-select" id="inputGroupSelect01">
    <option selected>Choose...</option>
    <option value="1">One</option>
    <option value="2">Two</option>
    <option value="3">Three</option>
  </select>
</div>
<div className="row">
<div className="col-md-6">
  
  <label for="dateofbirth">From</label>
<input type="date" name="dateofbirth" id="dateofbirth"></input>
</div>
<div className="col-md-6">
 
  <label for="dateofbirth">To</label>
<input type="date" name="dateofbirth" id="dateofbirth"></input>
</div>
</div> */}
 
<div className="row mt-4" style={{display:"flex",justifyContent:"space-evenly"}}   >
<div className="col-md-3 chartcard">
  <div className="card-text">
     <h3> {membersApiData.length}</h3> 
    <p>Members</p>
  </div>
</div>
<div className="col-md-3 chartcard">
  
   <div>
  
 <div className="card-text"  >  
   <h3>0</h3>
 <p>Shared</p>
</div>

    
   </div>
   
 
</div>
<div className=" col-md-3 chartcard">
  <div className="card-text">
    <h3>30</h3>
    <p>Viewed</p>
  </div>
</div>
<div className="col-md-3 chartcard">
  <div className="card-text">
    <h3>48</h3>
    <p>Visited</p>
  </div>
</div>

</div>

<div className="mt-4">
  <p style={{ fontSize:"12px", color:"#444791"}}><b>Compliance 360 Document Management</b></p>
  <div>
  <div><Bar options={options} data={sharepointChartData} /></div>
  <div><Line data={sharepointChartData} /></div>
  {/* <div><LineChart data={{
    UserData
  }}
  
  />
</div> */}
  </div>
</div>
  {/* <div style={{display:"flex",justifyContent:"flex-end", marginTop:'10px'}}>
  <button onClick={handleButtonClick} className="btn btn-primary btn-block" style={{width:'100%',fontSize:'12px', marginRight:'10px', borderRadius:'50px' ,color:'#444791' ,backgroundColor:'white'}}>See User Details</button>
 
  </div> */}
        </form>
        </div>
        

      </div>
    )}

{showAllAnalyticsPane && (
      <div style={{ width: '400px', height: '100%', backgroundColor: '#eeeeee', position: 'fixed',overflowY:"scroll", top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
        {/* Content of the right side pane */}
        <div>
         
          <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>

        </div>
        <div>
          <h5 style={{fontWeight:'800px', fontSize:"14px", color:"#444791"}}><b>Compliance 360 Projects Analytics</b></h5>
        </div>
        <div className="mt-4">
        <form >
        {/* <label for="fname">User</label>
        <div class="input-group mb-3">
  <select class="custom-select" id="inputGroupSelect01">
    <option selected>Choose...</option>
    <option value="1">One</option>
    <option value="2">Two</option>
    <option value="3">Three</option>
  </select>
</div>
<div className="row">
<div className="col-md-6">
  
  <label for="dateofbirth">From</label>
<input type="date" name="dateofbirth" id="dateofbirth"></input>
</div>
<div className="col-md-6">
 
  <label for="dateofbirth">To</label>
<input type="date" name="dateofbirth" id="dateofbirth"></input>
</div>
</div> */}
 
<div className="row mt-4" style={{display:"flex",justifyContent:"space-evenly"}}   >
<div className="col-md-3 chartcard">
  <div className="card-text">
     <h3> {membersApiData.length}</h3> 
    <p>Members</p>
  </div>
</div>
<div className="col-md-3 chartcard">
  
   <div>
  
 <div className="card-text"  >  
   <h3>0</h3>
 <p>Shared</p>
</div>

    
   </div>
   
 
</div>
<div className=" col-md-3 chartcard">
  <div className="card-text">
    <h3>30</h3>
    <p>Viewed</p>
  </div>
</div>
<div className="col-md-3 chartcard">
  <div className="card-text">
    <h3>48</h3>
    <p>Visited</p>
  </div>
</div>

</div>

<div className="mt-4">
  <p style={{ fontSize:"12px", color:"#444791"}}><b>Compliance 360 Document Management</b></p>
  <div>
    <div>
    {loader && <Loader />}
                    {!loader && <Dropdown
                        key={dropdownData.content}
                        search
                        items={dropdownData}
                        placeholder="Start typing a name"

                        noResultsMessage="We couldn't find any matches."
                        onChange={async (_, event) => await handleChange(event)}
                    />}
    </div>
  <div><Bar options={options} data={sharepointChartData} /></div>
  <div><Line data={sharepointChartData} /></div>
  {/* <div><LineChart data={{
    UserData
  }}
  
  />
</div> */}
  </div>
</div>
  {/* <div style={{display:"flex",justifyContent:"flex-end", marginTop:'10px'}}>
  <button onClick={handleButtonClick} className="btn btn-primary btn-block" style={{width:'100%',fontSize:'12px', marginRight:'10px', borderRadius:'50px' ,color:'#444791' ,backgroundColor:'white'}}>See User Details</button>
 
  </div> */}
        </form>
        </div>
        

      </div>
    )}
  
    <div className="row " style={{backgroundColor:'white'}}>
          <div className="col-md-6">

          </div>
          <div className="col-md-6" style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingInline:'20px',height:'50px'}}>
              <p style={{marginTop:'13px',fontSize:'12px', fontWeight:'600'}}>Welcome {userName ? ", " + userName : ""}</p>
             
                <img src={require('./Images/arrow-3.png')}></img>
                
            
                <img src={require('./Images/filter.png')}></img>
              
              <div className="searchBar">

         <input type="search " placeholder="Search "></input>

              </div>
              <button onClick={handleThirdButtonClick} className="btn" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791', color:'white'}}>New</button>
              <button onClick={handleAnalyticsClick} className="btn" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791', color:'white'}}>Analytics</button>
              {/* <button onClick={handleAllAnalyticsClick} className="btn" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791', color:'white'}}>All Analytics</button> */}
          </div>
          
    </div>
 
   
 <div className="container">
  
  <div>
   
   
  </div>
  <a onClick={handleTeamsClick}>
<div className="card1">
         <img src={require('./Images/logos_microsoft-teams.png')} ></img>
  <div className="card-text">
    <h3>{teamsApiData.length}</h3>
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
  <a onClick={handleSiteClick}>
  <div className="card4">
         <img src={require('./Images/sharepointlogo.png')} ></img>
 <div className="card-text">   
  <h3>  {siteApiData.length}</h3>
    
    <p>Sites</p>
 </div></div>
  </a>

<div className="card5">
         <img src={require('./Images/user-add.png')} ></img>
 <div className="card-text">
    <h3>{ownersApiData.length}</h3>
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

   <a onClick={handleGroupClick}>
<div className="card8">
  <img src={require('./Images/officeicon.png')} ></img>
<div className="card-text">
    <h3>{internalApiData.length}</h3>
    <p>Groups</p>
  </div>
 
</div>
</a>
</div>
 


{showDefault &&  (
<div className="welcome page">
      <div className="">
        <div className="row">
           <div className="col-md-12">
           <div className="row sitecard" style={{marginInline:'7px'}}>
         
    {siteApiData?.map((site) => (   
          <div className=" col-md-4" key={site.id} > 
          <div className="sec1"> 
    <div className="sec-flex">
    {/* {site.resourceProvisioningOptions[0] === 'Team' ? (
       <img src={require('./Images/teamsicon3.png')} alt="" />
      ) : (
        <img src={require('./Images/shpointlogo.png')} alt="" style={{paddingLeft:'7px'}}/>
      )} */}
     <img src={require('./Images/shpointlogo.png')} alt="" style={{paddingLeft:'7px'}}/>
      <div className="mainContent">    
              
      <a href={site.webUrl  + '/Shared%20Documents'} target="_blank">
           <h6> {site.displayName}</h6></a>  
        <p>Created {site.createdDateTime}</p>
      </div>
    </div>
    <div className="mainBody">
    <p>  {site.description}</p>
    </div>
    

    <div className="flex">

      <div className="sec1-hr">
        <p>Resourc...</p>
      </div>
      

      <div className="sec2-hr">
        <p>Resourc...</p>
      </div>

      <div className="sec3-hr">
        <p>Resourc...</p>
      </div>

      <div className="sec4-hr">
        <p>Resourc...</p>
      </div>

    </div>
    <div style={{alignItems:"center",borderTop:"solid 1px lightgrey",marginTop:"10px"}}>
      <div className="row">
      <div className="grid-flex col-md-6">
          <div className="sec1-grid" style={{textAlign:'center'}}>
            <a  href={site.webUrl  + '/Shared%20Documents'} target="_blank">        
          <FontAwesomeIcon icon={faFolderOpen}  />
          <p className="text-dark">Library</p> </a>
          {/* <i class="fa-regular fa-pen"></i>
        <p>Analytics</p> */}
          </div>
          <div className="sec1-grid" style={{textAlign:'center'}}>
            <a  href={site.webUrl} target="_blank">          
          <FontAwesomeIcon icon={faFolderOpen} />
          <p className="text-dark">Site</p> </a>
          </div>
          <div className="sec1-grid" style={{textAlign:'center'}}>
            <a  onClick={handleAnalyticsClick}>          
          <FontAwesomeIcon icon={faFolderOpen} />
          <p className="text-dark">Analytics</p> </a>
          </div>
      {/* <div className="sec1-grid">
      <img src={require('./Images/edit.png')} alt="" />
      </div> */}
    </div>

     <div className="col-md-6" style={{display:'flex',justifyContent:'flex-end'}}>
     <img src={require('./Images/ellipsis.png')} alt="" className="p-3" />
    </div> 
      </div>
     
   </div> 


  </div>
        
              </div>
             
        ))}
          </div>
           </div>
        </div>
    
      </div>
    </div>)}

{showGroup &&  (
  <div className="row">
  <div className="col-md-12">
  <div className="row sitecard" style={{marginInline:'7px'}}>
 
  {internalApiData && internalApiData?.map((user) => (   
 <div className=" col-md-4" key={user.id} > 
 <div className="sec1"> 
<div className="sec-flex">
{/* {site.resourceProvisioningOptions[0] === 'Team' ? (
<img src={require('./Images/teamsicon3.png')} alt="" />
) : (
<img src={require('./Images/shpointlogo.png')} alt="" style={{paddingLeft:'7px'}}/>
)} */}
<img src={require('./Images/office2.png')} alt="" style={{paddingLeft:'7px'}}/>
<div className="mainContent">    
     
<a href={user.webUrl} target="_blank">
  <h6> {user.displayName}</h6></a>  
<p>Created {user.createdDateTime}</p>
</div>
</div>
<div className="mainBody">
<p>  {user.description}</p>
</div>


<div className="flex">

<div className="sec1-hr">
<p>Resourc...</p>
</div>


<div className="sec2-hr">
<p>Resourc...</p>
</div>

<div className="sec3-hr">
<p>Resourc...</p>
</div>

<div className="sec4-hr">
<p>Resourc...</p>
</div>

</div>
<div style={{alignItems:"center",borderTop:"solid 1px lightgrey",marginTop:"10px"}}>
<div className="row">
<div className="grid-flex col-md-6">
 <div className="sec1-grid">
  
 <img src={require('./Images/analytics.png')} alt="" />
 {/* <i class="fa-regular fa-pen"></i>
<p>Analytics</p> */}
 </div>
<div className="sec1-grid">
<img src={require('./Images/owners.png')} alt="" />
{/* <i class="fa-regular fa-pen"></i>
<p>Owners</p> */}
</div>
<div className="sec1-grid">
<img src={require('./Images/edit.png')} alt="" />
{/* <i class="fa-regular fa-pen"></i>
<p>Analytics</p> */}
</div>
</div>

<div className="col-md-6" style={{display:'flex',justifyContent:'flex-end'}}>
<img src={require('./Images/ellipsis.png')} alt="" className="p-3" />
</div> 
</div>

</div> 


</div>

     </div>
    
))}
 </div>
  </div>
</div>)}

  {showSite && (
      <div className="welcome page">
      <div className="">
        <div className="row">
           <div className="col-md-12">
           <div className="row sitecard" style={{marginInline:'7px'}}>
          
    {siteApiData?.map((site) => (   
          <div className=" col-md-4" key={site.id} > 
          <div className="sec1"> 
    <div className="sec-flex">
    {/* {site.resourceProvisioningOptions[0] === 'Team' ? (
       <img src={require('./Images/teamsicon3.png')} alt="" />
      ) : (
        <img src={require('./Images/shpointlogo.png')} alt="" style={{paddingLeft:'7px'}}/>
      )} */}
     <img src={require('./Images/shpointlogo.png')} alt="" style={{paddingLeft:'7px'}}/>
      <div className="mainContent">    
              
      <a href={site.webUrl  + '/Shared%20Documents'} target="_blank">
           <h6> {site.displayName}</h6></a>  
        <p>Created {site.createdDateTime}</p>
      </div>
    </div>
    <div className="mainBody">
    <p>  {site.description}</p>
    </div>
    

    <div className="flex">

      <div className="sec1-hr">
        <p>Resourc...</p>
      </div>
      

      <div className="sec2-hr">
        <p>Resourc...</p>
      </div>

      <div className="sec3-hr">
        <p>Resourc...</p>
      </div>

      <div className="sec4-hr">
        <p>Resourc...</p>
      </div>

    </div>
    <div style={{alignItems:"center",borderTop:"solid 1px lightgrey",marginTop:"10px"}}>
      <div className="row">
      <div className="grid-flex col-md-6">
          <div className="sec1-grid" style={{textAlign:'center'}}>
            <a  href={site.webUrl  + '/Shared%20Documents'} target="_blank">        
          <FontAwesomeIcon icon={faFolderOpen}  />
          <p className="text-dark">Library</p> </a>
          {/* <i class="fa-regular fa-pen"></i>
        <p>Analytics</p> */}
          </div>
          <div className="sec1-grid" style={{textAlign:'center'}}>
            <a  href={site.webUrl} target="_blank">          
          <FontAwesomeIcon icon={faFolderOpen} />
          <p className="text-dark">Site</p> </a>
          {/* <i class="fa-regular fa-pen"></i>
        <p>Analytics</p> */}
          </div>
      {/* <div className="sec1-grid">
      <img src={require('./Images/edit.png')} alt="" />
      </div> */}
    </div>

     <div className="col-md-6" style={{display:'flex',justifyContent:'flex-end'}}>
     <img src={require('./Images/ellipsis.png')} alt="" className="p-3" />
    </div> 
      </div>
     
   </div> 


  </div>
        
              </div>
             
        ))}
          </div>
           </div>
        </div>
    
      </div>
    </div>
  )}

{showTeams && (
      <div className="welcome page">
      <div className="">
        <div className="row">
           <div className="col-md-12">
           <div className="row sitecard" style={{marginInline:'7px'}}>
          
    {teamsApiData?.map((teams) => (   
          <div className=" col-md-4" key={teams.id} > 
          <div className="sec1"> 
    <div className="sec-flex">
    {/* {site.resourceProvisioningOptions[0] === 'Team' ? (
       <img src={require('./Images/teamsicon3.png')} alt="" />
      ) : (
        <img src={require('./Images/shpointlogo.png')} alt="" style={{paddingLeft:'7px'}}/>
      )} */}
     <img src={require('./Images/teamsicon3.png')} alt="" style={{paddingLeft:'7px'}}/>
      <div className="mainContent">    
              
   
           <h6> {teams.displayName}</h6>
        <p>Created {teams.createdDateTime}</p>
      </div>
    </div>
    <div className="mainBody">
    <p>  {teams.description}</p>
    </div>
    

    <div className="flex">

      <div className="sec1-hr">
        <p>Resourc...</p>
      </div>
      

      <div className="sec2-hr">
        <p>Resourc...</p>
      </div>

      <div className="sec3-hr">
        <p>Resourc...</p>
      </div>

      <div className="sec4-hr">
        <p>Resourc...</p>
      </div>

    </div>
    <div style={{alignItems:"center",borderTop:"solid 1px lightgrey",marginTop:"10px"}}>
      <div className="row">
      <div className="grid-flex col-md-6">
          <div className="sec1-grid" style={{textAlign:'center'}}>
                
          <FontAwesomeIcon icon={faFolderOpen}  />
          <p className="text-dark">Library</p> 
          {/* <i class="fa-regular fa-pen"></i>
        <p>Analytics</p> */}
          </div>
          <div className="sec1-grid" style={{textAlign:'center'}}>
          <a  href={`https://teams.microsoft.com/l/team/groupId=${teams.id}`} target="_blank">      
          <FontAwesomeIcon icon={faFolderOpen} />
          <p className="text-dark">Team</p> 
          </a>
          {/* <i class="fa-regular fa-pen"></i>
        <p>Analytics</p> */}
          </div>
      {/* <div className="sec1-grid">
      <img src={require('./Images/edit.png')} alt="" />
      </div> */}
    </div>

     <div className="col-md-6" style={{display:'flex',justifyContent:'flex-end'}}>
     <img src={require('./Images/ellipsis.png')} alt="" className="p-3" />
    </div> 
      </div>
     
   </div> 


  </div>
        
              </div>
             
        ))}
          </div>
           </div>
        </div>
    
      </div>
    </div>
  )}

  
    
    </>
  );
}

// const client = Client.init({
//   authProvider: (done) => {
//     done(null, accessToken);
//   }
// });

// const response = await client.api("/sites").get();

// const sites = response.value;

// console.log(sites);
