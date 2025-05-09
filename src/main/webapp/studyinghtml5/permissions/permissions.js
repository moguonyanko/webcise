/**
 * @fileOverview Permissons APIを調査するためのモジュールです。
 */

class PermittedExecutor {
    constructor( {descriptor,
        onPermitted = () => {},
        onDenied = () => {},
        onChange = () => {},
        oneTime = true
    }) {
        this.descriptor = descriptor;
        this.actionBy = {
            granted: onPermitted,
            prompt: onPermitted,
            denied: onDenied
        };
        this.onChange = onChange;
        this.oneTime = oneTime;
    }

    async execute() {
        const status = await navigator.permissions.query(this.descriptor);
        status.onchange = this.onChange;
        if (typeof this.actionBy[status.state] === "function") {
            try {
                await this.actionBy[status.state](status);
            } finally {
                // 1回限りのPermissionだった場合はrevokeを呼び出して
                // Permissionの初期化を試みる。
                if (this.oneTime) {
                    const result = await this.revoke();
                    console.info(result);
                }
            }
        }
    }

    async revoke() {
        if (typeof navigator.permissions.revoke !== "function") {
            // revokeが未実装の場合はPermissionStatusと同じプロパティが定義された
            // オブジェクトを値に持つPromiseを返す。
            return Promise.resolve({state: null});
        }
        return await navigator.permissions.revoke(this.descriptor);
    }
}

const getPosition = options => {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
};

const runTest = async () => {
    const descriptor = {
        name: "geolocation"
    };
    const executor = new PermittedExecutor({
        descriptor,
        onPermitted: async status => {
            console.info(status);
            const options = {
                enableHighAccuracy: false,
                timeout: 3000,
                maximumAge: 0
            };
            try {
                const result = await getPosition(options);
                console.info(result);
            } catch (err) {
                console.warn(err);
            }
        },
        onDenied: status => {
            console.info(status);
        },
        onChange: event => {
            console.log(event);
        }
    });

    await executor.execute();
};

const myPermissions = {
    PermittedExecutor,
    test: {
        runTest
    }
};

export default myPermissions;
