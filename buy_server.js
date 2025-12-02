/** @param {NS} ns */
export async function main(ns) {
    // How much ram to buy: 8 GB
    const ram = 8;

    // Iterator to be used in the while loop
    let i = 0;

    // Loop till we reach the server limit
    while (i < ns.getPurchasedServerLimit()) {
        // Check if we have enough money
        if (ns.getServerMoneyAvailable("home") > ns.getPurchasedServerCost(ram)) {
            // Purchase server
            let hostname = ns.purchaseServer("pserver" + i, ram);
            // Copy program to newly purchased server
            ns.scp("basic_hack.js", hostname);
            // Execute the program
            ns.exec("basic_hack.js", hostname, 3, "joesguns");
            // Increment the iterator
            ++i;
        }

        // Pause to prevent the game from crashing
        await ns.sleep(1000);
    }
}