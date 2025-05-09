((window, document) => {
    "use strict";
    
    const samples = {
        /**
         * 参考:
         * https://github.com/mdn/samples-server/blob/master/s/webrtc-simple-datachannel/main.js
         */
        rtcDataChannelSample() {
            const base = document.querySelector(".rtcdatachannel-sample");
            const connecter = base.querySelector(".connecter"),
                disconnecter = base.querySelector(".disconnecter"),
                sender = base.querySelector(".sender"),
                inputMessage = base.querySelector(".input-message"),
                outputMessage = base.querySelector(".output-message");
                
            let localConnection, 
                remoteConnection;   
                
            let sendChannel,
                receiveChannel;

            const onReceiveChannelStatusChange = () => {
                if (receiveChannel) {
                    const now = new Date().toLocaleString();
                    console.log(`Received channel: ${receiveChannel.readyState} at ${now}`);
                }
            };
            
            const changeDisconnectionElement = () => {
                connecter.disabled = null;
                disconnecter.disabled = "disabled";
                sender.disabled = "disabled";
                inputMessage.value = "";
                inputMessage.disabled = "disabled";
            };
            
            const disconnect = () => {
                [ sendChannel, receiveChannel ].forEach(c => c.close());
                
                // Channelのcloseに失敗するとConnectionのcloseが行われないのでは。
                [ localConnection, remoteConnection ].forEach(c => c.close());
                
                [ 
                    localConnection, 
                    remoteConnection, 
                    sendChannel, 
                    receiveChannel 
                ].forEach(c => c = null);
            };
            
            const sendMessage = () => {
                const message = inputMessage.value;
                if (!message) {
                    return;
                }
                sendChannel.send(message);
                inputMessage.value = "";
                inputMessage.focus();
            };
            
            const onSendChannelStatusChange = () => {
                if (!sendChannel) {
                    return;
                }
                
                if (sendChannel.readyState === "open") {
                    inputMessage.disabled = null;
                    inputMessage.focus();
                    sender.disabled = null;
                    disconnecter.disabled = null;
                    connecter.disabled = "disabled";
                } else {
                    inputMessage.disabled = "disabled";
                    sender.disabled = "disabled";
                    disconnecter.disabled = "disabled";
                    connecter.disabled = null;
                }
            };
            
            const onReceivedMessage = event => {
                const content = document.createTextNode(event.data);
                const p = document.createElement("p");
                p.appendChild(content);
                outputMessage.appendChild(p);
            };
            
            const updateReceiveChannel = event => {
                receiveChannel = event.channel;
                receiveChannel.onmessage = onReceivedMessage;
                receiveChannel.onopen = onReceiveChannelStatusChange;
                receiveChannel.onclose = onReceiveChannelStatusChange;
            };
            
            const onAddCandidateError = err => {
                console.error(`Unable to add candidate: ${err.message}`);
            };
            
            const onCreateDescriptionError = err => {
                console.error(`Unable to create description: ${err.message}`);
            };
            
            const connect = () => {
                localConnection = new RTCPeerConnection();
                
                sendChannel = localConnection.createDataChannel("sendChannel");
                sendChannel.onopen = onSendChannelStatusChange;
                sendChannel.onclose = onSendChannelStatusChange;
                
                remoteConnection = new RTCPeerConnection();
                remoteConnection.ondatachannel = updateReceiveChannel;
                
                localConnection.onicecandidate = event => {
                    !event.candidate || remoteConnection.addIceCandidate(event.candidate)
                                                    .catch(onAddCandidateError);
                };
                
                remoteConnection.onicecandidate = event => {
                    !event.candidate || localConnection.addIceCandidate(event.candidate)
                                                    .catch(onAddCandidateError);
                };
                
                localConnection.createOffer()
                    .then(offer => localConnection.setLocalDescription(offer))
                    .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
                    .then(() => remoteConnection.createAnswer())
                    .then(answer => remoteConnection.setLocalDescription(answer))
                    .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
                    .catch(onCreateDescriptionError);
            };  
            
            const addListener = () => {
                connecter.addEventListener("click", connect);
                disconnecter.addEventListener("click", () => {
                    disconnect();
                    changeDisconnectionElement();
                });
                sender.addEventListener("click", sendMessage);
            };
            
            addListener();
        }        
    };
    
    window.addEventListener("load", () => {
        Object.keys(samples).forEach(key => samples[key]());
    });
})(window, document);