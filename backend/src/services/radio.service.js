import dns from 'dns';
import util from 'util';
const resolveSrv = util.promisify(dns.resolveSrv);



export function fetchRandomStation() {
    return {
        name: "Random Station",
        url: "https://example.com/random"
    };
}
/**
 * Get a list of base urls of all available radio-browser servers
 * Returns: array of strings - base urls of radio-browser servers
 */
function get_radiobrowser_base_urls() {
    return resolveSrv("_api._tcp.radio-browser.info").then(hosts => {
        hosts.sort();
        return hosts.map(host => "https://" + host.name);
    });
}

/**
 * Get a random available radio-browser server.
 * Returns: string - base url for radio-browser api
 */
export function get_radiobrowser_base_url_random() {
    return get_radiobrowser_base_urls().then(hosts => {
        var item = hosts[Math.floor(Math.random() * hosts.length)];
        console.log(item);
        return item;
    });
}

// get_radiobrowser_base_urls().then(hosts => {
//     console.log("All available urls")
//     console.log("------------------")
//     for (let host of hosts) {
//         console.log(host);
//     }
//     console.log();

//     return get_radiobrowser_base_url_random();
// }).then(random_host => {
//     console.log("Random base url")
//     console.log("------------------")
//     console.log(random_host);
// });

// export { fetchRandomStation };