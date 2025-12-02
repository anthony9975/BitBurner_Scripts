/** @param {NS} ns */
export async function main(ns) {
    // Incorrect usage of function
    if (ns.args.length < 4) {
        ns.tprint("Usage: script_deploy.js <script name> <host server> <target server>");
        return;
    }

    // Collect the inputs
    const script = ns.args[0];
    const host = ns.args[1];
    const target = ns.args[2];

    // Copy the script to the host server
    ns.scp(script, host, "home");
    // Execute the script on the host server
    ns.exec(script, host, 1, target);
}