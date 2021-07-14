const fs = require('fs');

module.exports = nodecg => {
    const switchLayoutRep = nodecg.Replicant('switchLayout', {defaultValue: 'intermission.html'});
    const rtmpChanger = nodecg.Replicant('rtmpChanger', {defaultValue: ''});
    const donationTracker = nodecg.Replicant('donationTracker', {defaultValue: [], persistent: false});
    const donationTotal = nodecg.Replicant('donationTotal', {defaultValue: 0.0});
    const subscriptionTracker = nodecg.Replicant('subscriptionTracker', {defaultValue: [], persistent: false});
    const donationLock = nodecg.Replicant('donationLock', {defaultValue: 0, persistent: false});
    const darujmeTracker = nodecg.Replicant('darujmeTracker', 'nodecg-czskm-darujme');
    const streamlabs = nodecg.extensions['nodecg-streamlabs'];

    switchLayoutRep.on('change', newVal => {
        fs.writeFile('./bundles/nodecg-czskm/dashboard/currentlayout.json', newVal.split('.html')[0], function (err) {
            if (err) return console.log(err);
        });
    });

    rtmpChanger.on('change', newVal => {
        fs.writeFile('./bundles/nodecg-czskm/dashboard/rtmpchange.json', newVal, function (err) {
            if (err) return console.log(err);
        });
    });

    streamlabs.on("streamlabs-event", event => {
        if (event.type == 'donation') {
            if (donationTracker.value.length == 3) {
                donationTracker.value.shift();
            }
            donationTracker.value.push({
                name: event.message.name,
                amount: event.message.amount.amount,
                message: event.message.message
            });
            donationTotal.value += event.message.amount.amount;
        }
    });

    streamlabs.on("twitch-event", event => {
        if (event.type == 'subscription') {
            if (subscriptionTracker.value.length == 3) {
                subscriptionTracker.value.shift();
            }
            subscriptionTracker.value.push({
                name: event.message.name,
                message: event.message.message,
                months: event.message.months
            });
        }
    });
    
    // Only for Darujme.cz donations
    darujmeTracker.on('change', newVal => {
        donationTracker.value.push({
            name: newVal.name,
            amount: newVal.amount,
            message: newVal.message
        });
        donationTotal.value += newVal.amount;
    });
}
