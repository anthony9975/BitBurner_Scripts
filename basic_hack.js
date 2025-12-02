/** @param {NS} ns */
export async function main(ns) {
    // Check for arguments
    if (ns.args.length < 1) {
        ns.tprint("Usage: basic_hack.js <server name>\n");
        return;
    }
    // Define target server
    const target = ns.args[0];

    // Get the maximum money on server
    const moneyThresh = ns.getServerMaxMoney(target);

    // Get minimum security level
    const minSecurity = ns.getServerMinSecurityLevel(target);

    // Hack the server
    while (true) {
        // If security is not minimum, weaken it
        if (ns.getServerSecurityLevel(target) > minSecurity)
            await ns.weaken(target);

        // If money is not maximum, grow it
        else if (ns.getServerMoneyAvailable(target) < moneyThresh)
            await ns.grow(target);

        // Hack for money
        else
            await ns.hack(target);
    }
}