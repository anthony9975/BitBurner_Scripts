/** @param {NS} ns */
export async function main(ns) {
    // Get host name
    const target = ns.args[0];

    // Hack
    while (true)
        await ns.hack(target);
}