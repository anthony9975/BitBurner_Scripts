/* @param {NS} ns*/
export async function main(ns){
    // Wait a second for deploy to die
    await ns.sleep(1000);

    // Not enough arguments
    if (ns.args.length < 6)
        throw new Error("Missing target server argument");

    // Get arguments
    const host = ns.args[0];
    const target = ns.args[1];
    const max_threads = ns.args[2];
    const sleep_time = ns.args[3];
    const min_security = ns.args[4];
    const max_money = ns.args[5];
    
    // Scripts to manage
    const scripts = ["hack_v2/weaken.js", "hack_v2/grow.js", "hack_v2/hack.js"];

    // Delegate equal threads to each script
    let ratio = [Math.floor(max_threads / 3), Math.floor(max_threads / 3)];
    ratio.push(max_threads - 2*ratio[0]);

    // Start scripts
    let pids = [];
    for (let i = 0; i < 3; ++i) {
        pids.push([]);
        for (let j = 0; j < ratio[i]; j++) {
            pids[i].push(ns.exec(scripts[i], host, 1, target));
        }
    }
    ns.print(pids); 

    // Optimize ratios
    // Stats: security - ideal, too low
    //        money - ideal, too high
    let stats = [[0, 0], [0, 0]];
    while (true) {
        // Security level
        let sec_level = ns.getServerSecurityLevel(target);
        // Too low
        if (sec_level == min_security)
            stats[0][1]++;
        // Good
        else if (aboutEqual(sec_level, min_security))
            stats[0][0]++;
        // Bad
        else {
            stats[0][0]--;
            stats[0][1]--;
        }

        // Money
        let money = ns.getServerMoneyAvailable(target);
        // Too high
        if (money == max_money)
            stats[1][1]++;
        // Good
        if (aboutEqual(money, max_money))
            stats[1][0]++;
        // Bad
        else {
            stats[1][0]--;
            stats[1][1]--;
        }

        // Reset stats
        let reset1 = false;
        let reset2 = false;

        // Security consistently low --> decrease weaken scripts
        if (stats[0][1] > 3 && pids[0].length > 0) {
            ns.kill(pids[0].pop());
            // Money consistenly high --> decrease grow
            if (stats[1][1] > 3 && pids[1].length > 0) {
                ns.kill(pids[1].pop());
                reset2 = true; // Reset the counter for money
                // Add another hack
                pids[2].push(ns.exec(scripts[2], host, 1, target));
            }
            // Money is ideal
            if (stats[1][0] > 3)
                // Start hack script
                pids[2].push(ns.exec(scripts[2], host, 1, target));
            else
                // Start grow script
                pids[1].push(ns.exec(scripts[1], host, 1, target));

            // Reset the counter for security
            reset1 = true;

            // Money consistently full --> decrease grow
        } else if (stats[1][1] > 3 && pids[1].length > 0) {
            // Kill grow
            ns.kill(pids[1].pop());

            // Security is ideal
            if (stats[0][0] > 3)
                // Add hack
                pids[2].push(ns.exec(scripts[2], host, 1, target));
            else
                // Start a weaken script
                pids[0].push(ns.exec(scripts[0], host, 1, target));

            reset2 = true; // Reset money counter

            // Security level too high
        } else if (stats[0][0] < -3 && pids[2].length > 0) {
            // Kill a hack
            if (pids[2].length > 0){
                // Kill hack
                ns.kill(pids[2].pop());
                // Start a weaken script
                pids[0].push(ns.exec(scripts[0], host, 1, target));
            }

            // Kill a grow
            if (pids[2].length > 0){
                // Kill hack
                ns.kill(pids[1].pop());
                // Start a weaken script
                pids[0].push(ns.exec(scripts[0], host, 1, target));
            }

            reset1 = true; // Reset security counter
            // Money level too low
        } else if (stats[1][0] < -3 && pids[2].length > 0) {
            // Kill hack
            ns.kill(pids[2].pop());
            // Start grow script
            pids[1].push(ns.exec(scripts[1], host, 1, target));

            reset2 = true; // Reset money counter
        }

        if (reset1) {
            stats[0] = [0, 0];
            reset1 = false;
        }
        if (reset2) {
            stats[1] = [0, 0];
            reset2 = false;
        }

        await ns.sleep(sleep_time);
    }
}

// Takes the actual statistics and the ideal statistic and compares them
function aboutEqual(a, b) {
    return Math.abs(a - b) < b * 0.05;
}