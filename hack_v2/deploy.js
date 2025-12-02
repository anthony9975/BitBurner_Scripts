/** @param {NS} ns */
export async function main(ns) {
    // Name of the host this script is running on
    const name = ns.getHostname();
    // Name of target server
    if (ns.args.length < 1) {
        ns.tprint("Missing target server argument");
        return;
    }
    const target = ns.args[0];
    // Scripts to use
    const scripts = ["hack_v2/weaken.js", "hack_v2/grow.js", "hack_v2/hack.js"];

    // Get number of threads to use
    let max_ram = 0;
    for (let script of scripts) {
        ns.scp(script, name, "home");
        if (max_ram < ns.getScriptRam(script))
            max_ram = ns.getScriptRam(script);
    }
    const max_t = (ns.getServerMaxRam(name) - ns.getServerUsedRam(name)) / max_ram;
    // Error, not enough memory to run all 3 scripts
    if (max_t < 3) {
        ns.tprint("Not enough memory");
        return;
    }

    // Get sleep time between checks
    const sleep_time = Math.max(ns.getHackTime(target), ns.getGrowTime(target),
        ns.getWeakenTime(target));

    // Delegate equal threads to each script
    let ratio = [Math.floor(max_t / 3), Math.floor(max_t / 3),
    Math.floor(max_t * (1 - 2 / 3))];

    // Start the scripts
    ns.killall(name, true); // Reset the server
    let pids = [];
    for (let i = 0; i < 3; ++i) {
        pids.push([]);
        for (let j = 0; j < ratio[i]; j++) {
            pids[i].push(ns.exec(scripts[i], name, 1, target));
        }
    }
    ns.tprint(pids);

    // Optimize ratios
    // Stats: security - ideal, too low
    //        money - ideal, too high
    let stats = [[0, 0], [0, 0]];
    // Min security
    const min_security = ns.getServerMinSecurityLevel(target);
    // Max money
    const max_money = ns.getServerMaxMoney(target);
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
                pids[2].push(ns.exec(scripts[2], name, 1, target));
            }
            // Money is ideal
            if (stats[1][0] > 3)
                // Start hack script
                pids[2].push(ns.exec(scripts[2], name, 1, target));
            else
                // Start grow script
                pids[1].push(ns.exec(scripts[1], name, 1, target));

            // Reset the counter for security
            reset1 = true;

            // Money consistently full --> decrease grow
        } else if (stats[1][1] > 3 && pids[1].length > 0) {
            // Kill grow
            ns.kill(pids[1].pop());

            // Security is ideal
            if (stats[0][0] > 3)
                // Add hack
                pids[2].push(ns.exec(scripts[2], name, 1, target));
            else
                // Start a weaken script
                pids[0].push(ns.exec(scripts[0], name, 1, target));

            reset2 = true; // Reset money counter

            // Security level too high
        } else if (stats[0][0] < -3 && pids[2].length > 0) {
            // Kill hack
            ns.kill(pids[2].pop());
            // Start a weaken script
            pids[0].push(ns.exec(scripts[0], name, 1, target));

            reset1 = true; // Reset security counter

            // Money level too low
        } else if (stats[1][0] < -3 && pids[2].length > 0) {
            // Kill hack
            ns.tprint(pid[2].pop());
            // Start grow script
            pids[1].push(ns.exec(scripts[1], name, 1, target));

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