/** @param {NS} ns */
export async function main(ns) {
    // Get host name
    const target = ns.args[0];

    // Weaken it forever
    while (true)
        await ns.weaken(target);
}