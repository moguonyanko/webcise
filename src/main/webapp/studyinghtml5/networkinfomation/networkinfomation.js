/**
 * @fileOverview NetforkInfomationAPI調査用モジュール
 */

const getConnection = () => {
    return navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
};

const getConnectionType = () => {
    const con = getConnection();
    if (con) {
        return con.effectiveType || con.type;
    } else {
        throw new Error("Connection is not found");
    }
};

const getConnectionInfomation = con => {
    const info = [
        `Type:${con.type}`,
        `Effective Type:${con.effectiveType}`,
        `RTT:${con.rtt}`,
        `Downlink:${con.downlink}`
    ];
    return info.join(",");
};

const runTest = () => {
    try {
        console.log(`${getConnectionType()}`);
        const con = getConnection();
        console.log(`${getConnectionInfomation(con)}`);
    } catch (e) {
        console.log(e);
    }
};

const networkInfomationLib = {
    netinfo: {
        runTest,
        getConnection,
        getConnectionInfomation,
        getConnectionType
    }
};

export default networkInfomationLib;
