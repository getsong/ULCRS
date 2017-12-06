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
let os = require("os");
let initialStartWindow = ()=>{
    startWindow = new BrowserWindow({
        width: 400,
        height: 300,
        show: false,
        webPreferences: {
            preload: __dirname + '/preload.js'
        }
    });
    startWindow.loadURL('file://' + __dirname + '/index.html');
    startWindow.once('ready-to-show', function () {
        startWindow.show();
    }); //ready-to-show
};

let startJavaBackendServer = ()=>{
    // Start Java backend server
    let spawn = require('child_process').spawn;

    let child = spawn('java', ['-jar', '../build/libs/ULCRS.jar']);

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
    return child;
};

let handleAppExit = (child) => {

        app.on("window-all-closed",function () {
            if (os.platform() === "win32") {
                let tk = require("tree-kill");
                tk.kill(child.pid, 'SIGKILL', (err)=>{console.log(err)});
                app.quit();
            }
        });


    app.on("will-quit", ()=>{
        console.log("In will quit");
        if (os.platform() === "win32"){
            let tk = require("tree-kill");
            tk.kill(child.pid, 'SIGKILL', (err)=>{console.log(err)});
        }else{
            child.kill()
        }
    });
};

let setupAuthenticWindow = () => {
    authWindow = new BrowserWindow({
        width: 900,
        height: 506,
        transparent: false,
        show: false,
        frame: true
    });

    ipc.on("ShowViewTutor", function (event, args) {
        event.returnValue = '';
        startWindow.hide();
        authWindow.loadURL("http://dropin.engr.wisc.edu");
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
        session.defaultSession.cookies.get({domain: "dropin.engr.wisc.edu"}, (error, cookies) => {
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
        frame: true
    });
}

app.on('ready', function () {

    initialStartWindow();
    let javaServerProcess = startJavaBackendServer();
    setupViewTutorWindow(1600, 900);
    handleAppExit(javaServerProcess);
    setupAuthenticWindow();
    keepPollingUntilCookieReceivedThenRedirect();


    let polling_schedules = null;

    ipc.on("post_generate", function (event, args) {

        // fetch("http://localhost:4567/ulcrs/generate_schedules", {method: "POST"})
        //     .then(res => {event.sender.send("post_success");});

        // Need error handling
        console.log('preparing schedule data');
        //event.sender.send("receiveScheduleData", data)
        event.sender.send("post_success");

        // // set up time interval
        // polling_schedules = setInterval(()=>{
        //     fetch('http://localhost:4567/ulcrs/schedules')
        //         .then(res => res.txt)
        //         .then(data => {
        //             if (data !== "null") {
        //                 console.log("received data");
        //                 event.sender.send("receiveScheduleData", data);
        //                 clearInterval(polling_schedules);
        //             }
        //         });
        // }, 500);
        let data = "";

        setTimeout(()=> {event.sender.send("receive-schedule-data", data);}, 2000);
    });


    // Handler for receiving different message
    ipc.on("kill-app", (event,  args) =>{

        viewTutorsWindow.close();
        app.quit();
    });


    // change the api for receive actual data
    ipc.on("request-tutor-data", (event, args) => {
        let addCookieOption = {
            headers: {"Set-Cookie": [engrCookie.name + "="+ engrCookie.value]}
        };

        let request = new fetch.Request('http://localhost:4567/ulcrs/tutor/', addCookieOption);

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
    });

    ipc.on("save-session", (event, filename, schedule) => {
        let addCookieOption = {
            headers: {"Set-Cookie": [engrCookie.name + "=" + engrCookie.value]},
            method: "POST",
            body: JSON.stringify(schedule)
        };
        console.log("====================Fetch call started=======================");
        console.log("-------Option.body-------");
        console.log(addCookieOption.body);
        fetch('http://localhost:4567/ulcrs/session/' + filename, addCookieOption);
        console.log("====================Fetch call ended=======================");
    })
}); //app is ready
