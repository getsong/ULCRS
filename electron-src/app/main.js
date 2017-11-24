var electron = require('electron');
var session = electron.session;
var BrowserWindow = electron.BrowserWindow;
var app = electron.app;
var ipc = electron.ipcMain;
let net = electron.net;
var serverProcess = null;
let startWindow, viewTutorsWindow, authWindow = null;
let engrCookie = null;
let fetch = require("node-fetch");

let initialStartWindow = ()=>{
    startWindow = new BrowserWindow({
        width: 400,
        height: 300,
        show: false
    });
    startWindow.loadURL('file://' + __dirname + '/index.html');
    startWindow.once('ready-to-show', function () {
        startWindow.show();
    }); //ready-to-show
};

let startJavaBackendServer = ()=>{
    // Start Java backend server
    serverProcess = require('child_process').exec;

    let child = serverProcess('java -jar ../build/libs/ULCRS.jar');

    child.stdout.on('data', function (data) {
        console.log('Server stdout: ' + data);
    });

    child.stderr.on('data', function (data) {
        console.log('Server stderr: ' + data);
    });

    child.on('close', function (code) {
        child.stdin.pause();
        console.log('Server closing code: ' + code);
        console.log('Killed.............');
    });

    child.on('exit', function(code){

        console.log("ending");
        // This code is a little bit weird
        app.quit();
    });
};

let handleAppExit = () => {
    app.on("will-quit", ()=>{
        console.log("In will quit");
        child.kill()
    });
};

let setupAuthenticWindow = () => {
    authWindow = new BrowserWindow({
        width: 900,
        height: 506,
        transparent: false,
        show: false,
        frame: false
    });

    ipc.on("ShowViewTutor", function (event, args) {
        event.returnValue = '';
        startWindow.hide();
        authWindow.loadURL("http://dropin-dev.engr.wisc.edu");
        authWindow.once("ready-to-show", () => {
            authWindow.show();
        });
    });
};

let keepPollingUntilCookieReceivedThenRedirect = () => {
    let redirect = function () {
        authWindow.close();
        viewTutorsWindow.loadURL('file://' + __dirname + '/viewtutors.html');
        viewTutorsWindow.once('ready-to-show', function () {
            viewTutorsWindow.show();
        });
    };

    let interval = setInterval(() => {
        session.defaultSession.cookies.get({domain: "dropin-dev.engr.wisc.edu"}, (error, cookies) => {
            if (error !== null) {
                console.log("ERROR *====");
                console.log(error);
                clearInterval(interval);
            }
            if (cookies.length !== 0) {
                engrCookie = cookies[0];
                console.log(typeof engrCookie);
                redirect();
                clearInterval(interval);
            }
        })
    }, 500);
};

let setupViewTutorWindow = (width, height)=>{
    viewTutorsWindow = new BrowserWindow({
        width: width,
        height: height,
        transparent: false,
        show: false,
        frame: false
    });
}

app.on('ready', function () {

    initialStartWindow();
    startJavaBackendServer();
    setupViewTutorWindow(1600, 900);
    handleAppExit();
    setupAuthenticWindow();
    keepPollingUntilCookieReceivedThenRedirect();


    // Handler for receiving different message
    ipc.on("show-view-schedules", function (event, args) {
        // event.returnValue = '';
        // viewSchedulesWindow.show();
        // viewTutorsWindow.hide();
        let data = "";
        console.log('preparing schedule data');
        event.sender.send("receive-schedule-data", data)
    });

    ipc.on("kill-app", (event,  args) =>{

        viewTutorsWindow.close();
        app.quit();
    });


    // change the api for receive actual data
    ipc.on("request-tutor-data", (event, args) => {
        let addCookieOption = {
            headers: {"Set-Cookie": [engrCookie.name + "="+ engrCookie.value]}
        };

        fetch('http://localhost:4567/ulcrs/tutor/', addCookieOption)
            .then(res => res.text())
            .then(body => event.sender.send("get-tutor-data", body));
        // });
    });
    ipc.on("request-course-data", (event, args) => {
        let addCookieOption = {
            headers: {"Set-Cookie": [engrCookie.name + "="+ engrCookie.value]}
        };
        fetch('http://localhost:4567/ulcrs/course/', addCookieOption)
            .then(res => res.text())
            .then(body => event.sender.send("get-course-data", body));
    })
}); //app is ready
