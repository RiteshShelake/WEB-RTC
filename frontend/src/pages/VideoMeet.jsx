import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import MicIcon2 from '@mui/icons-material/Mic';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonIcon from '@mui/icons-material/Person';
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(3);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [permissionRequested, setPermissionRequested] = useState(false);
    let [permissionGranted, setPermissionGranted] = useState(false);
    let [permissionError, setPermissionError] = useState("");
    let [isRequestingPermissions, setIsRequestingPermissions] = useState(false);

    const videoRef = useRef([])
    let [videos, setVideos] = useState([])

    useEffect(() => {
        console.log("HELLO")
        // Don't automatically request permissions - wait for user action
    }, [])

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const requestPermissions = async () => {
        setIsRequestingPermissions(true);
        setPermissionError("");
        
        try {
            // Request both video and audio permissions at once
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
            });
            
            if (stream) {
                setVideoAvailable(true);
                setAudioAvailable(true);
                setPermissionGranted(true);
                setPermissionRequested(true);
                
                // Set up the local video stream
                window.localStream = stream;
                if (localVideoref.current) {
                    localVideoref.current.srcObject = stream;
                }
                
                console.log('Camera and microphone permissions granted');
            }
        } catch (error) {
            console.log('Permission error:', error);
            setPermissionError("Camera and microphone access is required for video calls. Please allow permissions and try again.");
            setPermissionGranted(false);
            setPermissionRequested(true);
        } finally {
            setIsRequestingPermissions(false);
        }
    };

    const retryPermissions = () => {
        setPermissionRequested(false);
        setPermissionError("");
        setPermissionGranted(false);
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio])

    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    }

    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }

    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()
        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = function (event) {
                        setVideos((videos) => [...videos, { socketId: socketListId, stream: event.stream }])
                    }

                    if (window.localStream) {
                        try {
                            connections[socketListId].addStream(window.localStream)
                        } catch (e) { }
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
    }
    let handleAudio = () => {
        setAudio(!audio)
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    let openChat = () => {
        setModal(true);
        setNewMessages(0);
    }
    let closeChat = () => {
        setModal(false);
    }
    let handleMessage = (e) => {
        setMessage(e.target.value);
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        console.log(socketRef.current);
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }

    let connect = () => {
        if (!permissionGranted) {
            requestPermissions();
            return;
        }
        setAskForUsername(false);
        getMedia();
    }

    // Check for screen sharing capability
    useEffect(() => {
        if (navigator.mediaDevices.getDisplayMedia) {
            setScreenAvailable(true);
        } else {
            setScreenAvailable(false);
        }
    }, []);

    return (
        <div>
            {askForUsername === true ? (
                <div style={{ 
                    minHeight: '100vh', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.95)',
                        padding: '40px',
                        borderRadius: '20px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                        textAlign: 'center',
                        maxWidth: '450px',
                        width: '100%',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <div style={{ marginBottom: '30px' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px',
                                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                            }}>
                                <VideocamIcon style={{ fontSize: '40px', color: 'white' }} />
                            </div>
                            <h2 style={{ 
                                color: '#2c3e50', 
                                marginBottom: '10px',
                                fontSize: '28px',
                                fontWeight: 'bold'
                            }}>
                                Join Video Call
                            </h2>
                            <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
                                Ready to connect with others?
                            </p>
                        </div>

                        {!permissionRequested ? (
                            <>
                                <div style={{ marginBottom: '30px' }}>
                                    <h3 style={{ 
                                        color: '#34495e', 
                                        marginBottom: '15px',
                                        fontSize: '20px',
                                        fontWeight: '600'
                                    }}>
                                        Camera & Microphone Access
                                    </h3>
                                    <p style={{ 
                                        color: '#7f8c8d', 
                                        marginBottom: '25px',
                                        lineHeight: '1.6'
                                    }}>
                                        To join the video call, we need access to your camera and microphone for the best experience.
                                    </p>
                                    
                                    <div style={{ 
                                        display: 'flex', 
                                        justifyContent: 'center', 
                                        gap: '30px', 
                                        marginBottom: '25px' 
                                    }}>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                background: 'linear-gradient(45deg, #3498db 0%, #2980b9 100%)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 10px',
                                                boxShadow: '0 5px 15px rgba(52, 152, 219, 0.3)'
                                            }}>
                                                <CameraAltIcon style={{ fontSize: '30px', color: 'white' }} />
                                            </div>
                                            <p style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: '500' }}>Camera</p>
                                        </div>
                                        <div style={{ textAlign: 'center' }}>
                                            <div style={{
                                                width: '60px',
                                                height: '60px',
                                                background: 'linear-gradient(45deg, #e74c3c 0%, #c0392b 100%)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                margin: '0 auto 10px',
                                                boxShadow: '0 5px 15px rgba(231, 76, 60, 0.3)'
                                            }}>
                                                <MicIcon2 style={{ fontSize: '30px', color: 'white' }} />
                                            </div>
                                            <p style={{ color: '#7f8c8d', fontSize: '14px', fontWeight: '500' }}>Microphone</p>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <TextField 
                                        id="outlined-basic" 
                                        label="Enter your name" 
                                        value={username} 
                                        onChange={e => setUsername(e.target.value)} 
                                        variant="outlined" 
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <PersonIcon style={{ marginRight: '10px', color: '#7f8c8d' }} />
                                            ),
                                        }}
                                        style={{ 
                                            marginBottom: '20px',
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '12px'
                                            }
                                        }}
                                    />

                                    <Button 
                                        variant="contained" 
                                        onClick={requestPermissions}
                                        disabled={!username.trim() || isRequestingPermissions}
                                        style={{
                                            background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            padding: '15px 30px',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            textTransform: 'none',
                                            boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                                            transition: 'all 0.3s ease',
                                            width: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
                                        }}
                                    >
                                        {isRequestingPermissions ? 'Requesting Permissions...' : 'Allow Camera & Microphone'}
                                    </Button>
                                </div>
                            </>
                        ) : permissionGranted ? (
                            <>
                                <div style={{ marginBottom: '30px' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'linear-gradient(45deg, #27ae60 0%, #2ecc71 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px',
                                        boxShadow: '0 10px 30px rgba(39, 174, 96, 0.4)'
                                    }}>
                                        <CheckCircleIcon style={{ fontSize: '40px', color: 'white' }} />
                                    </div>
                                    <h3 style={{ 
                                        color: '#27ae60', 
                                        marginBottom: '10px',
                                        fontSize: '22px',
                                        fontWeight: 'bold'
                                    }}>
                                        ✓ Permissions Granted!
                                    </h3>
                                    <p style={{ color: '#7f8c8d', fontSize: '16px' }}>
                                        Camera and microphone access has been enabled successfully.
                                    </p>
                                </div>

                                <div style={{ marginBottom: '25px' }}>
                                    <TextField 
                                        id="outlined-basic" 
                                        label="Enter your name" 
                                        value={username} 
                                        onChange={e => setUsername(e.target.value)} 
                                        variant="outlined" 
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <PersonIcon style={{ marginRight: '10px', color: '#7f8c8d' }} />
                                            ),
                                        }}
                                        style={{ marginBottom: '20px' }}
                                    />

                                    <Button 
                                        variant="contained" 
                                        onClick={connect}
                                        disabled={!username.trim()}
                                        style={{
                                            background: 'linear-gradient(45deg, #27ae60 0%, #2ecc71 100%)',
                                            color: 'white',
                                            padding: '15px 30px',
                                            borderRadius: '12px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            textTransform: 'none',
                                            boxShadow: '0 8px 25px rgba(39, 174, 96, 0.3)',
                                            transition: 'all 0.3s ease',
                                            width: '100%'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = '0 12px 35px rgba(39, 174, 96, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = '0 8px 25px rgba(39, 174, 96, 0.3)';
                                        }}
                                    >
                                        Join Call
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={{ marginBottom: '30px' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        background: 'linear-gradient(45deg, #e74c3c 0%, #c0392b 100%)',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 20px',
                                        boxShadow: '0 10px 30px rgba(231, 76, 60, 0.4)'
                                    }}>
                                        <CancelIcon style={{ fontSize: '40px', color: 'white' }} />
                                    </div>
                                    <h3 style={{ 
                                        color: '#e74c3c', 
                                        marginBottom: '10px',
                                        fontSize: '22px',
                                        fontWeight: 'bold'
                                    }}>
                                        ✗ Permissions Denied
                                    </h3>
                                    <p style={{ 
                                        color: '#7f8c8d', 
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        marginBottom: '20px'
                                    }}>
                                        {permissionError}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                    <Button 
                                        variant="outlined" 
                                        onClick={retryPermissions}
                                        style={{ 
                                            borderColor: '#3498db', 
                                            color: '#3498db',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            textTransform: 'none'
                                        }}
                                    >
                                        Try Again
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        onClick={() => window.location.href = "/"}
                                        style={{ 
                                            backgroundColor: '#e74c3c',
                                            padding: '12px 24px',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            textTransform: 'none'
                                        }}
                                    >
                                        Go Back
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer}>
                    {showModal ? (
                        <div className={styles.chatRoom}>
                            <div className={styles.chatContainer}>
                                <h1>Chat</h1>

                                <div className={styles.chattingDisplay}>
                                    {messages.length !== 0 ? messages.map((item, index) => (
                                        <div style={{ marginBottom: "20px" }} key={index}>
                                            <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                            <p>{item.data}</p>
                                        </div>
                                    )) : <p>No Messages Yet</p>}
                                </div>

                                <div className={styles.chattingArea}>
                                    <TextField 
                                        value={message} 
                                        onChange={(e) => setMessage(e.target.value)} 
                                        id="outlined-basic" 
                                        label="Enter Your chat" 
                                        variant="outlined" 
                                    />
                                    <Button variant='contained' onClick={sendMessage}>Send</Button>
                                </div>
                            </div>
                        </div>
                    ) : null}

                    <div className={styles.buttonContainers}>
                        <IconButton onClick={handleVideo} style={{ color: "white" }}>
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                            <CallEndIcon />
                        </IconButton>
                        <IconButton onClick={handleAudio} style={{ color: "white" }}>
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ? (
                            <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                            </IconButton>
                        ) : null}

                        <Badge badgeContent={newMessages} max={999} color='orange'>
                            <IconButton onClick={() => setModal(!showModal)} style={{ color: "white" }}>
                                <ChatIcon />
                            </IconButton>
                        </Badge>
                    </div>

                    <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>

                    <div className={styles.conferenceView}>
                        {videos
                            .filter(video => video.socketId !== socketIdRef.current) // Exclude self
                            .map((video) => (
                                <div key={video.socketId}>
                                    <video
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                    />
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    )
}
