'use strict';

// Note: Some Variable names are purposefully prefixed with 'engage' keyword so as not to collide with Application's global variables.
// Only the variables which may potentially collide with Application global variables are prefixed with engage keyword for better readability.

/**
 * When sdk is not explicitly included in the application using the <script> tag, this will be false.
 * If its false, the sdk will be downloaded from the given engageDomain.
 */
let isEngageDigitalSdkLoaded = window.EngageDigital ? true : false;
let engageClickToCallConfig;

let engageMakeCallBtn;
let engageRemoteAudio;

let engageStatusDiv;

let engageDigitalClient;
let engageDigitalSession;
let engagShowimage

/**
 * When engageDigitalClickToCallConfig object is available do the initialization on the fly.
 * If its not there Application has to call initializeEngageDigitalClickToCall() explicitly with right configuration.
 */
if (window.engageDigitalClickToCallConfig) {
  initializeEngageDigitalClickToCall(window.engageDigitalClickToCallConfig);
  document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
  document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
}

function initializeEngageDigitalClickToCall(engageDigitalClickToCallConfig) {
  engageClickToCallConfig = engageDigitalClickToCallConfig;

  engageLog('Starting');
  engageMakeCallBtn = document.getElementById(engageClickToCallConfig.callBtnId)
  engageMakeCallBtn.innerHTML = engageClickToCallConfig.makeCallText;
  engageMakeCallBtn.addEventListener('click', callController);
  engageMakeCallBtn.disabled = true;
  // engagShowimage = document.getElementById("myP").style.visibility ="visible";
  engageRemoteAudio = document.getElementById(engageClickToCallConfig.remoteAudioId);
  engageStatusDiv = document.getElementById(engageClickToCallConfig.alertDivId);

  if (!engageDigitalClient || !engageDigitalClient.isConnected()) {
    connectToEngageDigital();
  }
}

function callController() {
  handleCallStateChange(engageCallState);
}

// To reset the audio tag controls
function toResetAudioControls() {
  let audio = engageRemoteAudio;
      audio.pause();
      audio.currentTime = 0
}

const callInitialState = {
  execute: () => {
    engageLog('Executing callInitialState');
    engageMakeCallBtn.innerHTML = engageClickToCallConfig.makeCallText;
    engageMakeCallBtn.disabled = false;
  },
  name: 'callInitialState'
}

const callNewState = {
  execute: () => {
    engageLog('Executing callNewState');
    engageMakeCallBtn.innerHTML = engageClickToCallConfig.disconnectCallText;
    makeCall();
  },
  name: 'callNewState'
}

const callConnectedState = {
  execute: () => {
    engageLog('Executing callConnectedState');
    engageMakeCallBtn.innerHTML = engageClickToCallConfig.disconnectCallText;
  },
  name: 'callConnectedState'
}

const callDisconnectedState = {
  execute: () => {
    engageLog('Executing callDisconnectedState');
    engageMakeCallBtn.innerHTML = engageClickToCallConfig.makeCallText;
    engageLog('Is Client Connected ? ' + engageDigitalClient.isConnected());
    if (!engageDigitalClient.isConnected()) {
      engageMakeCallBtn.disabled = true;
    }
  },
  name: 'callDisconnectedState'
}

const callCanBeEndedState = {
  execute: () => {
    engageLog('Executing callCanBeEndedState');
    engageMakeCallBtn.innerHTML = engageClickToCallConfig.makeCallText;
    disconnectCall();
  },
  name: 'callCanBeEndedState'
}

callInitialState.nextState = callNewState;
callNewState.nextState = callCanBeEndedState;
callConnectedState.nextState = callCanBeEndedState;
callDisconnectedState.nextState = callNewState;
callCanBeEndedState.nextState = callNewState;

let engageCallState = callInitialState;

function connectToEngageDigital() {

  const engageDomain = engageClickToCallConfig.engageDomain;

  if (isEngageDigitalSdkLoaded) {
    const userIdentity = Math.random().toString(36).substr(2, 7);

    const config = {
      log: {
        console: { enable: engageClickToCallConfig.consoleLog },
      },
      needRegistration: false
    };

    engageDigitalClient = new window.EngageDigital.EngageDigitalClient(userIdentity, engageDomain, config);
    registerForEngageDigitalClientEvents();

  } else {
    //Only load for the first time
    loadEngageDigitalSDK(engageDomain);
  }
}

function registerForEngageDigitalClientEvents() {

  /**
   * The Ready event is emitted when the SDK is initialized successfully and is ready
   * for operation. Once this event is received connect() API can be invoked.
   */
  engageDigitalClient.addEventHandler('ready', () => {
    engageDigitalClient.connect();
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
  });

  engageDigitalClient.addEventHandler('connecting', () => {
    updateStatus('Connecting to One Center...');
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"

  });

  /*
   * This event is being called when connectivity is established for the first time.
   */
  engageDigitalClient.addEventHandler('connected', () => {
    updateStatus('Connected to One Center');
    engageMakeCallBtn.disabled = false;
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
    handleCallStateChange(callInitialState);
  });

  /*
   * This event is emitted when the Connection with the engage domain is lost
   */
  engageDigitalClient.addEventHandler('disconnected', () => {
    updateStatus('Disconnected from One Center');
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
    toResetAudioControls()
    engageLog('Disconnected from One Center during the call state ' + engageCallState.name);
    //Let the Call Disconnect button be enabled when disconnect happens during the call
    if (engageCallState !== callCanBeEndedState) {
      engageMakeCallBtn.disabled = true;
    }
  });

  /*
   * This event is emitted when the sdk tries to re-connect when the already established connection is lost
   */
  engageDigitalClient.addEventHandler('reconnecting', () => {
    //Let the Call Disconnect button be enabled when reconnect happens during the call
    if (engageCallState !== callCanBeEndedState) {
      engageMakeCallBtn.disabled = true;
    }
    updateStatus('Re-connecting to One Center');
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
  });

  /**
   * Fired when the connection is re-established
   */
  engageDigitalClient.addEventHandler('reconnected', () => {
    engageMakeCallBtn.disabled = false;
    updateStatus('Re-connected to One Center');
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
  });

  engageDigitalClient.addEventHandler('failed', (error) => {
    callStateHandler(callDisconnectedState);
    updateStatus(JSON.stringify(error));
    toResetAudioControls()
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
  });

  engageDigitalClient.addEventHandler('errorinfo', ({ errorMessage }) => {
    updateStatus(errorMessage);
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
    toResetAudioControls()
  });

  /**
   * For an incoming/outgoing call this event will be triggered.
   * This event will carry an instance of EngageDigitalSession, on that call related events can be registered.
   * If the new session is for an incoming call EngageDigitalSession's acceptCall() API can be invoked to accept the call.
   */
  engageDigitalClient.addEventHandler('newRTCSession', onNewEngageSession);
}

function disConnectFromEngageDigital() {

  if (engageDigitalClient) {
    engageDigitalClient.disconnect();
    handleCallStateChange(callInitialState);
    updateStatus('Disconnected from One Center');
  }
}

function makeCall() {

  const callToNum = engageClickToCallConfig.callTo;

  try {
    const isVideoCall = engageClickToCallConfig.callType === 'video';

    engageDigitalClient.makeCall(callToNum, {
      mediaConstraints: {
        audio: true,
        video: isVideoCall
      },
      rtcOfferConstraints: {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: isVideoCall ? 1 : 0
      },
    
    });

  } catch (error) {
    updateStatus('Call: Provide valid phone number');
    engageLog('Error in make call : ' + error.errorMessage);
    handleCallStateChange(callInitialState);
  }
}

function onNewEngageSession(session) {

  engageLog('Got newRTCSession event direction is %s', session.getDirection());

  engageDigitalSession = session;

  /**
   * Can play some media file indicates call is ringing state
   */
  engageDigitalSession.addEventHandler('ringing', () => {
    updateStatus('Call: Ringing');
    document.getElementById(engageClickToCallConfig.ringingImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.ringingImage).style.display ="block"
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="none"
    document.getElementById(engageClickToCallConfig.connectedImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.connectedImage).style.display ="none"
  });

  /**
    * Call is connected, can use this event to update the status of call in UI
    */
  engageDigitalSession.addEventHandler('connected', () => {
    document.getElementById(engageClickToCallConfig.ringingImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.ringingImage).style.display ="none"
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="none"
    document.getElementById(engageClickToCallConfig.connectedImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.connectedImage).style.display ="block"
    updateStatus('Call: Connected');
    handleCallStateChange(callConnectedState);
  });

  /**
    * Call is disconnected by the client, can use this event to update the status of call in UI
    */
  engageDigitalSession.addEventHandler('disconnected', () => {
    updateStatus('Call: DisConnected');
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
    document.getElementById(engageClickToCallConfig.connectedImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.connectedImage).style.display ="none"
    document.getElementById(engageClickToCallConfig.ringingImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.ringingImage).style.display ="none"
    toResetAudioControls()
    handleCallStateChange(callDisconnectedState);
    clearVideoElements();
  });

  /**
    * Call is disconnected by the remote user, can use this event to update the status of call in UI
    */
  engageDigitalSession.addEventHandler('peerdisconnected', () => {
    updateStatus('Call: Remote party disconnected');
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
    document.getElementById(engageClickToCallConfig.connectedImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.connectedImage).style.display ="none"
    document.getElementById(engageClickToCallConfig.ringingImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.ringingImage).style.display ="none"
    toResetAudioControls()
    handleCallStateChange(callDisconnectedState);
    clearVideoElements();
  });

  /**
   * Call is failed 
   */
  engageDigitalSession.addEventHandler('failed', () => {
    updateStatus('Call: Failed');
    document.getElementById(engageClickToCallConfig.showImage).style.visibility ="visible"
    document.getElementById(engageClickToCallConfig.showImage).style.display ="block"
    document.getElementById(engageClickToCallConfig.connectedImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.connectedImage).style.display ="none"
    document.getElementById(engageClickToCallConfig.ringingImage).style.visibility ="hidden"
    document.getElementById(engageClickToCallConfig.ringingImage).style.display ="none"
    toResetAudioControls()
    clearVideoElements();
    handleCallStateChange(callDisconnectedState);
  });


  /**
    * On this event attach remote party's stream to the remote video element
    */
  engageDigitalSession.addEventHandler('remotestream', ({ stream }) => {
    handleRemoteStream(stream);
  });

  /**
   * Its an Incoming call, need to invoke acceptCall API on EngageDigitalSession.
   */
  if (engageDigitalSession.getDirection() === 'incoming') {
    handleIncomingCall();
  }

}

function handleRemoteStream(remoteStream) {

  const audioTracks = remoteStream.getAudioTracks();

  /**
   * Once the remote starts streaming audio, onloadedmetadata event
   * handler will be invoked and remote audio will also be available.
   */
  //Disabling the video tracks by default.
  // if (audioTracks.length > 0) {
  //   for (let i = 0; i < audioTracks.length; ++i) {
  //     audioTracks[i].enabled = false;
  //   }
  // }

  //Once audio is available, audio track will be enabled.
  engageRemoteAudio.onloadedmetadata = function () {
    for (let i = 0; i < audioTracks.length; ++i) {
      audioTracks[i].enabled = true;
    }
  };

  engageRemoteAudio.srcObject = null;
  engageRemoteAudio.srcObject = remoteStream;
}

function handleIncomingCall() {

  updateStatus('Incoming call....')
  engageDigitalSession.acceptCall({

    mediaConstraints: {
      audio: true,
      video: engageDigitalSession.isIncomingCallWithVideo(),
    },
  });
}

function disconnectCall() {
  if (engageDigitalSession) {
    engageDigitalSession.disconnectCall();
  }
}

function handleCallStateChange(toCallState) {
  engageLog('Current state ' + engageCallState.name);
  toCallState.execute();
  engageCallState = toCallState.nextState;
  engageLog('Next state ' + engageCallState.name);
}

function clearVideoElements() {
  engageRemoteAudiosrcObject = null;
}

function updateStatus(status) {
  if (engageStatusDiv) {
    engageStatusDiv.innerText = status;
  }
  engageLog(status);
}

function loadEngageDigitalSDK(engageDomain) {

  updateStatus('Loading One Center sdk...')

  const sdkScriptElement = document.createElement('script');

  sdkScriptElement.type = 'text/javascript';
  sdkScriptElement.async = false;
  sdkScriptElement.src = `https://${engageDomain}/engageDigital.js`

  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(sdkScriptElement, firstScriptTag);

  sdkScriptElement.addEventListener('load', () => {
    isEngageDigitalSdkLoaded = true;
    updateStatus('One Center sdk is loaded');
    connectToEngageDigital();
  });

  sdkScriptElement.addEventListener('error', () => {
    updateStatus(`Failed to load ${sdkScriptElement.src}. Is the given domain proper?`);
  });

}

window.addEventListener('unload', function (e) {
  engageDigitalClient.disconnect();
  e.preventDefault();
});

function engageLog(logStmt) {
  if (engageClickToCallConfig.consoleLog) {
    console.log(logStmt);
  }
}