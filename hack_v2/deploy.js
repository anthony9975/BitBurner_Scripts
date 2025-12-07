/** @param {NS} ns */
export async function main(ns) {
    // Not enough arguments error
    if (ns.args.length < 1) 
        throw new Error("Not enough arguments\nUsage: deploy.js <target>");
    
    // Get information
    const host = ns.getHostname(); // Host name
    const target = ns.args[0]; // Target name

    // Set up
    ns.killall(host, true); // Reset the server
    ns.scp(["hack_v2/manage.js", "hack_v2/weaken.js", "hack_v2/grow.js", "hack_v2/hack.js"], host, "home");

    // Get number of threads to use
    let max_ram = Math.max(ns.getScriptRam("hack_v2/weaken.js"), ns.getScriptRam("hack_v2/grow.js"),
                           ns.getScriptRam("hack_v2/hack.js"));
    const max_t = Math.floor((ns.getServerMaxRam(host) - ns.getScriptRam("hack_v2/manage.js")) / max_ram);
    // Error, not enough memory to run all 3 scripts
    if (max_t < 3)
        throw new Error("Not enough memory");

    // Get sleep time between checks
    const sleep_time = Math.max(ns.getHackTime(target), ns.getGrowTime(target),
                                ns.getWeakenTime(target));

    // Get security and money
    const min_security = ns.getServerMinSecurityLevel(host);
    const max_money = ns.getServerMaxMoney(host);

    // Log the results
    ns.print("Manage Ram: " + ns.getScriptRam("hack_v2/manage.js"));
    ns.print("Weaken Ram: " + ns.getScriptRam("hack_v2/weaken.js"));
    ns.print("Grow Ram: " + ns.getScriptRam("hack_v2/grow.js"));
    ns.print("Hack Ram: " + ns.getScriptRam("hack_v2/hack.js"));
    ns.print("Max threads: " + max_t);

    // Execute manage.js
    ns.exec("hack_v2/manage.js", host, 1, host, target, max_t, sleep_time, min_security, max_money);
}