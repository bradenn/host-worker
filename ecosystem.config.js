module.exports = {
    apps : [{
        name: "host-worker",
        script: "./index.js",
        env: {
            NODE_ENV: "production",
            PORT: 9955,
            NGINX: "/etc/nginx",
            TOKEN: "a good password?"
        }
    }]
}