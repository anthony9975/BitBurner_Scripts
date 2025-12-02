/** @param {NS} ns */
export async function main(ns) {
    // Constants
    const script = "basic_hack.js";

    // Get all purchased servers
    let p_servers = ns.getPurchasedServers();

    // Change the script for each server
    for (let server of p_servers) {
        // Calculate the max threads for the program
        let server_max_ram = ns.getServerMaxRam(server);
        let program_ram = ns.getScriptRam(script);
        let max_t = Math.floor(server_max_ram / program_ram);

        // Kill the processes running on the server
        ns.killall(server);
        // Copy the new version of script
        ns.scp(script, server);
        // Execute the script
        ns.exec(script, server, max_t, "harakiri-sushi");
        ns.tprint("Changed " + server + " to run " + script + " on harakiri-sushi\n");
    }
}