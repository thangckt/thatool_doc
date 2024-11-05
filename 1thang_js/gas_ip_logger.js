// Source: https://github.com/Matti-Krebelder/Website-IP-Logger
// Thang modifications:
// - With the help from GPT
// - Change from using `sendToDiscord` to `sendDataToGoogleApp`
// ref: Using Google App Mail: https://github.com/dwyl/learn-to-send-email-via-google-script-html-no-server

(function () {
    const ScriptId = 'AKfycbzM04ouw1vGf5wOZs4106A95PUbfpahtJ-_7cOl1_vWFGw5xey4YLENbGbiyIgs0Xd2tw'
    const URL = `https://script.google.com/macros/s/${ScriptId}/exec`

    // Async function to send JSON data to Google Sheets via Google Apps Script
    async function sendDataToGoogleApp(jsonData) {
        try {
            await fetch(URL, {
                method: 'POST',
                body: JSON.stringify(jsonData),
                headers: { 'Content-Type': "text/plain;charset=utf-8" },
                redirect: 'follow',
            });
        } catch (error) {
            console.error('Error while sending data to Google App:', error);
        }
    }

    // Fetch visitor info using ipapi.co API
    async function getVisitorInfo() {
        var visistorInfo = { ip: '', org: '', city: '', country: '', postal: '', asn: '', loc: '' };
        var res = await fetch('https://ipapi.co/json');
        var jdata = await res.json();
        if (jdata) {
            visistorInfo.ip = jdata.ip;
            visistorInfo.org = jdata.org;
            visistorInfo.city = jdata.city;
            visistorInfo.country = jdata.country_name;
            visistorInfo.postal = jdata.postal;
            visistorInfo.asn = jdata.asn;
            visistorInfo.loc = jdata.latitude + ',' + jdata.longitude;
        };
        if (jdata === null) {
            var res = await fetch('https://ipwho.is');
            var jdata = await res.json();
            if (jdata) {
                visistorInfo.ip = jdata.ip;
                visistorInfo.org = jdata.connection.isp;
                visistorInfo.city = jdata.city;
                visistorInfo.country = jdata.country;
                visistorInfo.postal = jdata.postal;
                visistorInfo.asn = jdata.connection.asn;
                visistorInfo.loc = jdata.latitude + ',' + jdata.longitude;
            };
        }
        if (jdata === null) {
            var res = await fetch('https://ipinfo.io/json');
            var jdata = await res.json();
            if (jdata) {
                visistorInfo.ip = jdata.ip;
                visistorInfo.org = jdata.org;
                visistorInfo.city = jdata.city;
                visistorInfo.country = jdata.country;
                visistorInfo.postal = jdata.postal;
                visistorInfo.loc = jdata.loc;
            };
        };
        return visistorInfo;
    }

    // Get browser information from user agent string
    function getBrowserInfo() {
        const ua = navigator.userAgent;
        const browserInfo = { name: 'Unknown', version: 'Unknown' };

        // Check for Safari on iOS devices
        if (/iP(hone|od|ad)/.test(ua) && /Safari/.test(ua) && !/CriOS/.test(ua) && !/FxiOS/.test(ua)) {
            const versionMatch = ua.match(/Version\/(\d+\.\d+)/);
            browserInfo.name = 'Safari';
            browserInfo.version = versionMatch ? versionMatch[1] : 'Unknown';
        } else {
            const browserData = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

            if (/trident/i.test(browserData[1])) {
                const version = /\brv[ :]+(\d+)/g.exec(ua) || [];
                browserInfo.name = 'IE';
                browserInfo.version = version[1] || 'Unknown';
            } else if (browserData[1] === 'Chrome') {
                const temp = ua.match(/\b(OPR|Edg)\/(\d+)/);
                if (temp) {
                    browserInfo.name = temp[1] === 'OPR' ? 'Opera' : 'Edge';
                    browserInfo.version = temp[2];
                } else {
                    browserInfo.name = 'Chrome';
                    browserInfo.version = browserData[2];
                }
            } else if (browserData[1]) {
                browserInfo.name = browserData[1];
                browserInfo.version = browserData[2];
            }

            // Handle Safari on desktop or other WebKit-based browsers
            if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
                const versionMatch = ua.match(/Version\/(\d+\.\d+)/);
                browserInfo.name = 'Safari';
                browserInfo.version = versionMatch ? versionMatch[1] : 'Unknown';
            }
        }

        return browserInfo;
    }

    function getTimestamp() {
        const options = {
            timeZone: "Asia/Seoul",
            year: 'numeric',
            month: 'short',  // short: "Jan", long: "January"
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false // 24-hour format
        };
        const timestamp = new Date().toLocaleString("en-US", options);
        return timestamp.replace(/ at /, ', ');
    }

    // Log visitor information and send to Google Sheet
    async function logVisitor() {
        const timestamp = getTimestamp()
        const visitorInfo = await getVisitorInfo();
        const browserInfo = getBrowserInfo();
        const currentUrl = window.location.href.replace(window.location.origin, '');

        const jsonData = {
            timestamp: timestamp,
            ip: visitorInfo.ip,
            org: visitorInfo.org,
            city: visitorInfo.city,
            region: visitorInfo.region,
            country: visitorInfo.country,
            postal: visitorInfo.postal,
            loc: visitorInfo.loc,
            asn: visitorInfo.asn,
            browser: `${browserInfo.name} ${browserInfo.version}`,
            os: navigator.platform,
            currentUrl: currentUrl,
        };
        await sendDataToGoogleApp(jsonData);
    }


    // Function trigger the visitor logging when the page loads
    window.onload = function () {
        setTimeout(logVisitor, 3000); // Wait for 5000 milliseconds (5 seconds) before calling logVisitor
    };

})();