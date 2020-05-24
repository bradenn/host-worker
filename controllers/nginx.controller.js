const env = require('../env/env');
const {promisify} = require('util');
const execCallback = require('child_process').exec;
const exec = promisify(execCallback);

let doesProxyExist = (domain) => new Promise((resolve, reject) => {
    let testCommand = `test -f ${env.NGINX}/proxies/${domain}.conf`;
    exec(testCommand).then(doc => {
        resolve(doc);
    }).catch(err => {
        reject(err);
    });
});

let updateProxy = (domain, host, port) => new Promise((resolve, reject) => {
    let proxyStatement = `proxy_pass: ${host}:${port || 80};`;
    let preparedCommand = `echo '${proxyStatement}' > ${env.NGINX}/proxies/${domain}.conf`;
    exec(preparedCommand).then(doc => {
       resolve(doc);
    }).catch(err => {
        reject(err);
    });
});

let proxyGet = (req, res) => {
    doesProxyExist(req.params.domain).then(doc => {
        let preparedCommand = `cat ${env.NGINX}/proxies/${req.params.domain}.conf`;
        exec(preparedCommand).then(doc => {
            let urlRegex = /(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm
            let targetHostExpression = "Error";
            try {
                targetHostExpression = urlRegex.exec(doc.stdout).toString();
            }catch(err){
                console.log(doc);
            }
            let targetHost = targetHostExpression;
            let targetPort = 80;
            if (targetHostExpression.split(':').length > 2) {
                targetHost = targetHostExpression.substr(0, targetHostExpression.lastIndexOf(':'));
                targetPort = targetHostExpression.substr(targetHostExpression.lastIndexOf(':') + 1, targetHostExpression.length);
            }
            res.status(200).json({
                success: true,
                target: {host: targetHost, port: targetPort, ssl: targetHost.startsWith('https')}
            })
        }).catch(err => {
            console.log(err);
            res.status(500).json({
                success: false,
                message: new Error("Domain exists but is not accessible.").toString(),
                error: JSON.stringify(err)
            });
        });
    }).catch(err => {
        res.status(404).json({success: false, message: new Error("Domain does not exist.").toString()});
    });
};

let proxyPost = (req, res) => {
    if (typeof req.body.host !== 'undefined') {
        doesProxyExist(req.params.domain).then(() => {
            res.status(409).json({success: false, message: new Error("Domain exists.").toString()});
        }).catch(() => {
            updateProxy(req.params.domain, req.body.host, req.body.port).then(doc => {
                res.status(201).json({success: true, message: "Proxy for domain added."});
            }).catch(err => {
                res.status(500).json({success: false, message: new Error("Failed to create reference.").toString()});
            });
        });
    }else{
        res.status(400).json({success: false, message: new Error("Malformed request; please provide host and port.").toString()});
    }
};

let proxyPut = (req, res) => {
    if (typeof req.body.host !== 'undefined') {
        updateProxy(req.params.domain, req.body.host, req.body.port).then(doc => {
            res.status(201).json({success: true, message: "Proxy for domain updated."});
        }).catch(err => {
            res.status(500).json({success: false, message: new Error("Failed to edit reference.").toString()});
        });
    }
};

let proxyDelete = (req, res) => {
    doesProxyExist(req.params.domain).then(() => {
        let preparedStatement = `rm ${env.NGINX}/proxies/${req.params.domain}.conf`;
        exec(preparedStatement).then(doc => {
            res.status(200).json({success: true, message: "Proxy for domain reference removed."})
        }).catch(err => {
            res.status(500).json({success: false, message: new Error("Failed to delete domain reference").toString()});
        });
    }).catch(() => {
        res.status(404).json({success: false, message: new Error("Domain reference does not exist.").toString()});
    });
};

exports.proxy = {
    get: proxyGet,
    post: proxyPost,
    put: proxyPut,
    delete: proxyDelete
};