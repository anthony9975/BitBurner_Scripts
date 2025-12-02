/** @param {NS} ns */
export async function main(ns) {
    // Get host name
    const target = ns.args[0];

    // Grow
    while (true)
        await ns.grow(target);
}