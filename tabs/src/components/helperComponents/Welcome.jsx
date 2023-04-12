import { useContext,useState,useEffect } from "react";
import { Image } from "@fluentui/react-northstar";
import "./Welcome.css";
import { app } from "@microsoft/teams-js";
import { AzureFunctions } from "./AzureFunctions";
import { useData } from "@microsoft/teamsfx-react";
import { TeamsFxContext } from "../Context";
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faFolderOpen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as microsoftTeams from "@microsoft/teams-js";
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';

import Group from "./Groups";
require('../../../node_modules/bootstrap/dist/css/bootstrap.min.css');

//import { Client } from "@microsoft/microsoft-graph-client";
//import { GraphUserProfile, IGraphUserProfile } from "./IGraphUserProfile";

export function Welcome(props) {
  const { environment, triggerConsent, apiClient } = {
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

//create sharepoint site
  const [postApiData, setPostApiData] = useState([]);
  const [description, setDescription] = useState('');
const [displayName, setDisplayName] = useState('');

  const HandleCreate = async (e) => {
    e.preventDefault();
     let body = {
      description: description,
      displayName: displayName,
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
const [restsiteApiData, setrestSiteApiData] = useState([]);
      useData(async () => {
        let response = await apiClient.get("restSite");
        setrestSiteApiData(response.data.value);
        console.log('restsitetesting' , response.data)
   });
   
// get sharepoint site data
const [siteApiData, setSiteApiData] = useState([]);
      useData(async () => {
        let response = await apiClient.get("site");
        setSiteApiData(response.data.value);
        console.log('sitetesting' , response.data)
   });

   // get group site data
   const [internalApiData, setInternalApiData] = useState([]);
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
  
    const closePage = () => {
      setShowFirstPane(false)
      setShowSecondPane(false)
      setShowThirdPane(false)
      setshowLastPane(false)
    }
  
    const handleButtonClick = () => {
      setshowLastPane(!showLastPane);
    };
    const handleNextButtonClick = () => {
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

  
  
  return (
    <>
    {showFirstPane && (
       
        <>
                  <div style={{ width: '500px', height: '1005px', backgroundColor: '#eeeeee', position: 'absolute', top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
                        <h6><b>New Workspace Request</b></h6>
                        <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>
                        <div>
                          <h4>Welcome {userName ? ", " + userName : ""}</h4>
                          <p>Let's start by selecting a workspace type for this request...  </p>


                          <div className="workspace-grid">

                            <div className="workspace-card">
                             <a href="">
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
  <div style={{ width: '500px', height: '1005px', backgroundColor: '#eeeeee', position: 'absolute', top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
  <h6><b>New Workspace Request</b></h6>
  <FontAwesomeIcon icon={faTimes} className="fontawesome" onClick={closePage}/>
  <div>
    <h3>Welcome {userName ? ", " + userName : ""}</h3>
    <p>Let's start by selecting a workspace type for this request...  </p>


    <div className="workspace-grid">

      <div className="workspace-card">
       <a href="">
         <div style={{display:"flex",alignItems:"center"}}>
          <img src={require('./Images/logos_microsoft-teams.png')} ></img>
            <h5 style={{marginLeft:"10px"}}><b>Secure Collaboration Team</b></h5>
        </div>
        <div>
            <p style={{marginTop:"11px",fontSize:"13px"}}>Productively work with teams and colleagues using chats,channels and advanced apps and document management features</p>
        </div>
       </a>
     </div>

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
      <a href="">
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
           <button onClick={handleNextButtonClick} className="btn btn-primary" style={{width:'80px',fontSize:'12px',marginRight:'10px',backgroundColor:'#444791'}}>Next</button>
           <button onClick={closePage} className="btn btn-primary" style={{width:'80px',fontSize:'12px', border:'solid 1px #444791' ,color:'#444791' ,backgroundColor:'#eeeeee'}}>Close</button>

        </div>
</div>
)
}

   {showThirdPane && (
      <div style={{ width: '400px', height: '1005px', backgroundColor: '#eeeeee', position: 'absolute', top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
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
           <button onClick={handleNextButtonClick } className="btn btn-primary" style={{width:'80px',fontSize:'12px', marginRight:'10px', border:'solid 1px #444791' ,color:'#444791' ,backgroundColor:'#eeeeee'}}>Back</button>
           <button onClick={handleThirdButtonClick && handleButtonClick} className="btn btn-primary" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791'}}>Next</button>
        </div>
       
      </div>
    )}

  {showLastPane && (
      <div style={{ width: '400px', height: '1005px', backgroundColor: '#eeeeee', position: 'absolute', top: '0', right: '0',padding:'30px',boxShadow:'3px 5px 10px 10px #E5E4E2',borderLeft:'solid 1px #E5E4E2',zIndex:'10' }}>
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
  <label for="fname">Site URL</label>
  <input type="text"  placeholder="Enter site URL" className="formlabel"></input>
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
  <button type='submit' onClick={HandleCreate || handleButtonClick} className="btn btn-primary" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791'}}>Submit</button>
  </div>
        </form>

      </div>
    )}
  
    <div className="row " style={{backgroundColor:'white'}}>
          <div className="col-md-6">

          </div>
          <div className="col-md-6" style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingInline:'60px',height:'50px'}}>
              <p style={{marginTop:'13px',fontSize:'12px', fontWeight:'600'}}>Welcome {userName ? ", " + userName : ""}</p>
             
                <img src={require('./Images/arrow-3.png')}></img>
                
            
                <img src={require('./Images/filter.png')}></img>
              
              <div className="searchBar">

         <input type="search " placeholder="Search "></input>

              </div>
              <button onClick={handleThirdButtonClick} className="btn" style={{width:'80px',fontSize:'12px',backgroundColor:'#444791', color:'white'}}>New</button>
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
 <form >
  <label>
    Description:
    <input type="text" name="description" value={teamDescription} onChange={(e) => setTeamDescription(e.target.value)} />


  </label>
  <label>
    Display Name:
    <input type="text" name="displayName" value={teamDisplayName} onChange={(e) => setTeamDisplayName(e.target.value)} />
  </label>
  <button type='submit' onClick={HandleCreateTeams} >Submit</button>

</form> 
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
