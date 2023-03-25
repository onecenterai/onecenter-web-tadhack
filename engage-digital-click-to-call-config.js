/**
 * This file name can be anything but don't change the variable name.
 */

var engageDigitalClickToCallConfig = {
    /** Engage Domain, Get it from the Platform admin */
    engageDomain: 'rtc.engagedigital.ai',

    /** The number to dial to. It should be a proper service number. Creating the service and assigning it to a number can be done through ESMP-UI. */
    callTo: 'sip:910103@10018-tadhack23.com',

    /** Type of call. Valid values are video or audio. */
    callType: 'audio',

    /** Id of the Call Button. Make sure the same id is used in your html call button.*/
    callBtnId: 'engage-digital-click-to-call-btn', 
    
    /** The text to be displayed in the call button before the establishment of the call*/
    makeCallText: '<img src="telephone.png" style = "height: 30px; width: 30px" alt="">',
    
    /** The text to be displayed on call button once the call is established or in the process of connecting. So the user will get the context and can disconnect the call.*/
    disconnectCallText: '<img src="call-end.png"  style = "height: 30px; width: 30px" alt="">',
    
   
    
    /** Id of the Remote Video element. Remote video will be rendered here*/
    remoteAudioId: 'engage-digital-remote-audio',
    
    /** If this div id is declared in the page, important events will be displayed there. This will help in debugging*/
    alertDivId: 'engage-digital-alert',
    
    /** If its true click-to-call logs as well as EngageDigital logs will be written to browser console*/
    consoleLog: true,
    
    /** To hide and show icon for partical events */
    showImage : 'initial',
    ringingImage : "Ringing",
    connectedImage : "Connected"
}