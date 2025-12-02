/** @param {NS} ns */
export async function main(ns) {
    // Server to be deleted
    const target = ns.args[0];

    // Kill any scripts running on that server
    const running_scripts = ns.ps(target);
    for (let i = 0; i < running_scripts.length; ++i) {
        ns.scriptKill(running_scripts[i].filename, target);
    }

    // Delete the server
    ns.deleteServer(target);
}