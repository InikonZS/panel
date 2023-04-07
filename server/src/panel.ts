import * as http from 'http';
import * as childProcess from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

interface ISiteBaseInfo{
    displayName: string,
    apacheSource: string, // /sitename
    apacheDest: string, // http://localhost:3000
    repoFolder: string,
    repoUrl: string,
    execPath: string, // /root/poker/Poker/server/dist/poker.js
    execCommand: string, // ???
    npmPath: string,
    npmBuildCommand: string,
    port: string,
    activated: 'yes' | 'no'
}

class SiteList{
    private fileName: string;
    private sites: Array<ISiteBaseInfo>;

    constructor(fileName: string){
        this.fileName = fileName;
    }

    async load(){
        return fs.readFile(this.fileName, {encoding:'utf8'}).then(res=>{
            const sites = JSON.parse(res);
            this.sites = sites;
        })
    }

    async save(){
        return fs.writeFile(this.fileName, JSON.stringify(this.sites), {encoding:'utf8'}).then(res=>{
            
        })
    }

    checkExecFile(site: ISiteBaseInfo){
        return fs.stat(site.execPath).then(res=>{

        })
    }

    async checkPm2Process(site:ISiteBaseInfo){
        const list: Array<typeof pm2proc> = await getPm2List();
        const found = list.find(it=>{
            it.pm2_env.pm_exec_path == site.execPath
        })
        return found;
    }
}


export class Panel{
    endpoints: Record<string, (props:any)=>Promise<Object>>
    constructor(){
        //childProcess.exec('git status', (err, out)=>{
        //    console.log(out);
        //});//.stdout.on('data', (ch)=> console.log('ch -> ', ch));
        this.endpoints = {
            getSites: this.getSites,
            addSite: this.addSite,
            setRepo: this.setRepo,
            deleteSite: this.deleteSite,
            //updateSite: this.updateSite
        }
    }

    async handleRequest(req:http.IncomingMessage):Promise<string>{
        const prefix = '/'; //for apache
        const url = req.url.slice(prefix.length);
        const endpointKey = url.split('/')[1].split('?')[0];
        console.log(endpointKey);
        const endpoint = this.endpoints[endpointKey];
        console.log(endpoint);

        const params: Record<string, string> = {};
        req.url.split('?')[1]?.split('&')?.forEach(it=>{
          const [key, value] = it.split('=');
          params[key] = value;
        });
        console.log(params);
        try{
            const result = await endpoint(params);
            return JSON.stringify(result);
        } catch(e){
            console.log(e);
            return ''
        }
    }

    getSites = async () => {
        const sites = await getSitesFolder();
        return {
            sites: sites
        }
    }

    updateSite = async (props:{name: string, url: string, port: string}) => {
        //updateConfig()
        //apacheReload()

        //removeRepo
        //cloneRepo
        //npmInstall
        //npmBuild
        //pm2 delete
        //pm2 start
        const result = await updateSite(props.name, {
            displayName: props.name,
            apacheSource: props.name,
            apacheDest: 'http://localhost:'+props.port||'3000',
            repoFolder: 'unuzed prop',
            repoUrl: props.url,//'https://github.com/InikonZS/reactShop.git',
            execPath: './dist/index.js',
            execCommand: '',
            npmPath: './server',
            npmBuildCommand: 'npm run build',
            activated: 'yes',
            port: props.port||'3000'
        });
        return {
            result
        }
    }

    deleteSite = async () => {
        //pm2 delete
        //updateConfig()
        apacheReload();
        //delete folder
        return {
        }
    }

    setRepo = async (props: {name:string, url:string, port: string}) => {
        const name = props.name;
        const url = props.url; 
        const siteFolder = path.join(sitesRoot, name);
        console.log(name, url);
        try{
            const stat = await fs.stat(siteFolder);
            //console.log(stat, siteFolder);
            if (!stat.isDirectory()){
                throw new Error('not site directory');
            }
            this.updateSite(props);
            //await this.cloneRepo(path.join(sitesRoot, name), url);
            return {ok: true};
        } catch(e){
            console.log(e);
            return {ok: false};
        } 
    }

    addSite = async () => {
        const domain = `node.inikon.online`;
        const apacheSitesDir = `/etc/apache2/sites-available`;
        //const apacheSitesDir = path.join(__dirname, 'config');
        const apacheConfigPath = path.join(apacheSitesDir, domain+'.conf');

        const configText= await updateConfig(domain);
        await fs.writeFile(apacheConfigPath, configText, {encoding:'utf8'}).then(res=>{

        });
        await apacheReload();
        /*const siteList = [
            {
                source: '/one',
                dest: 'http://localhost:4005'
            },
            {
                source: '/two',
                dest: 'http://localhost:4006'
            }
        ]
        const configText = generateConfig(domain, siteList);
        fs.writeFile(apacheConfigPath, configText, {encoding:'utf8'}).then(res=>{

        });*/
        // apache dir /etc/apache2/sites-available
        // edit apache file
        // reload apache
        // git clone checkout
        // site update
        // cd project dir
        // npm i npm run build
        // pm2 start build dir
        //
        try{
            await createSiteFolder('test'+(Math.random()* 10000).toFixed(0));
          //await cloneRepo('./test', 'https://github.com/InikonZS/reactShop.git', 'myDir1');
          //await npmInstall('./test', 'myDir1');
            return {
                ok: true,
                result: {}
            }  
        } catch(e){
            return {
                ok: false,
                result: e
            }  
        }
        
    }

    async cloneRepo(dir: string, url: string){
        const repoDir = 'repo';
        await cloneRepo(dir, url, repoDir);
        //await npmInstall(dir, repoDir, /*packageDir*/);
        
    }
}

async function findMeta(name:string) {
    const siteFolder = path.join(sitesRoot, name);
    try {
        const stat = await fs.stat(siteFolder);
        //console.log(stat, siteFolder);
        if (!stat.isDirectory()){
            throw new Error('not site directory');
        }
        return fs.readFile(path.join(siteFolder, 'meta.json'), {encoding:'utf8'}).then(res=>{
            const meta: ISiteBaseInfo = JSON.parse(res);
            return meta;
        })
    } catch(e){
        return null;
    }
}

async function updateSite(name:string, meta: ISiteBaseInfo){
    const oldMeta = await findMeta(name);
    console.log('update site ', name, oldMeta, meta);

    if (!meta) return;

    await fs.writeFile(path.join(sitesRoot, name, 'meta.json'), JSON.stringify(meta));

    const list: Array<typeof pm2proc> = await getPm2List();
    const proc = list.find(it=>{
        it.pm2_env.pm_exec_path == meta.execPath
    })

    if (proc) {
        console.log('Stop old site version process');
        await pm2Delete(proc.pm_id.toString()); 
    }
    
    if (oldMeta.repoUrl != meta.repoUrl){
        console.log('Repo is changed ', oldMeta.repoUrl, ' -> ', meta.repoUrl);
        await removeRepo(path.join(sitesRoot, name, 'repo'));
        await cloneRepo(path.join(sitesRoot, name), meta.repoUrl, 'repo');
    } else {
        await gitPull(path.join(sitesRoot, name), 'repo');
        //checkout or pull
    }
    
    await npmInstall(path.join(sitesRoot, name), 'repo');
    await exec(meta.npmBuildCommand, path.join(sitesRoot, name, 'repo', meta.npmPath));
    //removeRepo
    //cloneRepo
    //npmInstall
    //npmBuild
    if (meta.activated == 'yes'){
        await pm2Start(path.join(sitesRoot, name, meta.execPath), meta.port);
    }
}

function cloneRepo(dir: string, url: string, cloneName: string){
    return fs.mkdir(/*path.join(__dirname, dir)*/dir, {recursive: true}).then(()=>{
        return new Promise((resolve, reject) => {
            childProcess.exec(`git -c http.sslVerify=false clone ${url} ${cloneName}`, {
                cwd: dir//path.join(__dirname, dir)
            }, (code, res, err)=>{
                if (!code){
                    console.log(res, 'cloned');
                    resolve(res);
                } else {
                    console.log(code, err);
                    reject(err);
                }
            })
        }
    )})
}

async function gitPull(dir: string, cloneName: string){
    return exec(`git pull`, path.join(dir, cloneName));
}

function removeRepo(dir: string){
    return fs.rm(dir, {recursive: true});
}

function npmInstall(dir: string, cloneName: string){
    return new Promise((resolve, reject) => {
        childProcess.exec(`npm i`, {
            cwd: path.join(dir, cloneName)//path.join(__dirname, dir, cloneName)
        }, (code, res, err)=>{
            if (!code){
                console.log(res, 'installed');
                resolve(res);
            } else {
                console.log(code, err);
                reject(err);
            }
        })
    })
}

async function updateConfig(domain: string){
    const sites = await getSitesFolder();
    const metas = sites.filter(site => site.isDirectory == true && site.meta.apacheSource && site.meta.apacheDest).map(site=>{
        return {
            source: site.meta.apacheSource,
            dest: site.meta.apacheDest
        }
    });
    const config = generateConfig(domain, metas);
    return config;
}

function generateConfig(domain: string, proxyList: {source: string, dest: string}[]){
    const proxyPassText = proxyList.map(proxy=>{
        return [
            `ProxyPass /${proxy.source} ${proxy.dest}`,
            `ProxyPassReverse /${proxy.source} ${proxy.dest}`
        ].join('\n')
    }).join('\n\n');
    const template = `
<IfModule mod_ssl.c>
    <VirtualHost *:443>
        ServerName ${domain}
        ServerAdmin webmaster@localhost
        ProxyPreserveHost On

        ${proxyPassText}

        # DocumentRoot /var/www/html

        ErrorLog \${APACHE_LOG_DIR}/error2.log
        CustomLog \${APACHE_LOG_DIR}/access2.log combined

        SSLProxyEngine on
        #   SSLCertificateFile  /etc/ssl/certs/ssl-cert-snakeoil.pem
        #   SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key
        SSLCertificateFile /etc/letsencrypt/live/${domain}/cert.pem
        SSLCertificateKeyFile /etc/letsencrypt/live/${domain}/privkey.pem
        #   SSLCertificateChainFile /etc/apache2/ssl.crt/server-ca.crt
        SSLCertificateChainFile /etc/letsencrypt/live/${domain}/chain.pem
    </VirtualHost>
</IfModule>
`;
    return template;
}

function getPm2List(){
    return new Promise<Array<any>>((resolve, reject) => {
        childProcess.exec(`pm2 jlist`, {
        }, (code, res, err)=>{
            if (!code){
                resolve(JSON.parse(res.split('\n').join('')));
            } else {
                console.log(code, err);
                reject(err);
            }
        })
    });
}

async function exec(command: string, cwd: string = ''){
    return new Promise((resolve, reject) => {
        childProcess.exec(command, {
            cwd: cwd
        }, (code, res, err)=>{
            if (!code){
                resolve(res);
            } else {
                reject(err);
            }
        })
    });
}

async function pm2Start(execFile: string, port: string){
    return exec(`pm2 start ${execFile} --node-args "port=${port}"`);
}

async function pm2Delete(id: string){
    return exec(`pm2 delete ${id}`);
}

async function apacheReload(){
    //systemctl restart apache2
    //systemctl reload apache2
    return exec(`systemctl reload apache2`);
}

//const sitesRoot = '/root/sites'
const sitesRoot = path.join(__dirname, 'sites');
async function checkSiteDir(dir:string){
    try{
        //const stat = await fs.stat(sitesRoot);
        await fs.mkdir(dir);
    } catch(e){
        
    }
}
checkSiteDir(sitesRoot); 
checkSiteDir(path.join(__dirname, 'config')); 

async function getSitesFolder(){
    const result: {
        name: string,
        meta: ISiteBaseInfo,
        isDirectory: boolean
    }[] = [];

    const entries = await fs.readdir(sitesRoot)
    for (const entry of entries){
        const stat = await fs.stat(path.join(sitesRoot, entry));
        if (stat.isDirectory()){
            let meta = null;
            try{
                const metaRaw = await fs.readFile(path.join(sitesRoot, entry, 'meta.json'), {encoding: 'utf8'});
                meta = JSON.parse(metaRaw);
            } catch(e){

            }
            result.push({
                name: entry,
                isDirectory: true,
                meta: meta 
            })
        } else {
            result.push({
                name: entry,
                isDirectory: false,
                meta: null
            })
        }
    }
    return result;
}

async function createSiteFolder(name: string){
    try{
        await fs.mkdir(path.join(sitesRoot, name), {recursive: true});
        await fs.writeFile(path.join(sitesRoot, name, 'meta.json'), JSON.stringify({name: name}));
    } catch(e){

    }
}

const pm2proc = {
    "pid": 78762,
    "name": "poker",
    "pm2_env": {
        "kill_retry_time": 100,
        "windowsHide": true,
        "username": "root",
        "treekill": true,
        "automation": true,
        "pmx": true,
        "instance_var": "NODE_APP_INSTANCE",
        "watch": false,
        "autorestart": true,
        "vizion": true,
        "merge_logs": true,
        "env": {
            "SHELL": "/bin/bash",
            "PWD": "/root/poker/Poker/server/dist",
            "LOGNAME": "root",
            "MOTD_SHOWN": "pam",
            "HOME": "/root",
            "LS_COLORS": "rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.webp=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:",
            "SSH_CONNECTION": "37.212.24.248 17200 45.93.137.165 22",
            "LESSCLOSE": "/usr/bin/lesspipe %s %s",
            "TERM": "xterm-256color",
            "LESSOPEN": "| /usr/bin/lesspipe %s",
            "USER": "root",
            "SHLVL": "1",
            "SSH_CLIENT": "37.212.24.248 17200 22",
            "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin",
            "SSH_TTY": "/dev/pts/1",
            "_": "/usr/bin/pm2",
            "OLDPWD": "/root/poker/Poker/server",
            "PM2_USAGE": "CLI",
            "PM2_HOME": "/root/.pm2",
            "poker": {},
            "unique_id": "55c69c96-caba-4dd7-9ee3-391c020ee867"
        },
        "namespace": "default",
        //@ts-ignore
        "filter_env": [],
        "name": "poker",
        //@ts-ignore
        "node_args": [],
        "pm_exec_path": "/root/poker/Poker/server/dist/poker.js",
        "pm_cwd": "/root/poker/Poker/server/dist",
        "exec_interpreter": "node",
        "exec_mode": "fork_mode",
        "instances": 1,
        "pm_out_log_path": "/root/.pm2/logs/poker-out.log",
        "pm_err_log_path": "/root/.pm2/logs/poker-error.log",
        "pm_pid_path": "/root/.pm2/pids/poker-15.pid",
        "km_link": false,
        "vizion_running": false,
        "NODE_APP_INSTANCE": 0,
        "SHELL": "/bin/bash",
        "PWD": "/root/poker/Poker/server/dist",
        "LOGNAME": "root",
        "MOTD_SHOWN": "pam",
        "HOME": "/root",
        "LS_COLORS": "rs=0:di=01;34:ln=01;36:mh=00:pi=40;33:so=01;35:do=01;35:bd=40;33;01:cd=40;33;01:or=40;31;01:mi=00:su=37;41:sg=30;43:ca=30;41:tw=30;42:ow=34;42:st=37;44:ex=01;32:*.tar=01;31:*.tgz=01;31:*.arc=01;31:*.arj=01;31:*.taz=01;31:*.lha=01;31:*.lz4=01;31:*.lzh=01;31:*.lzma=01;31:*.tlz=01;31:*.txz=01;31:*.tzo=01;31:*.t7z=01;31:*.zip=01;31:*.z=01;31:*.dz=01;31:*.gz=01;31:*.lrz=01;31:*.lz=01;31:*.lzo=01;31:*.xz=01;31:*.zst=01;31:*.tzst=01;31:*.bz2=01;31:*.bz=01;31:*.tbz=01;31:*.tbz2=01;31:*.tz=01;31:*.deb=01;31:*.rpm=01;31:*.jar=01;31:*.war=01;31:*.ear=01;31:*.sar=01;31:*.rar=01;31:*.alz=01;31:*.ace=01;31:*.zoo=01;31:*.cpio=01;31:*.7z=01;31:*.rz=01;31:*.cab=01;31:*.wim=01;31:*.swm=01;31:*.dwm=01;31:*.esd=01;31:*.jpg=01;35:*.jpeg=01;35:*.mjpg=01;35:*.mjpeg=01;35:*.gif=01;35:*.bmp=01;35:*.pbm=01;35:*.pgm=01;35:*.ppm=01;35:*.tga=01;35:*.xbm=01;35:*.xpm=01;35:*.tif=01;35:*.tiff=01;35:*.png=01;35:*.svg=01;35:*.svgz=01;35:*.mng=01;35:*.pcx=01;35:*.mov=01;35:*.mpg=01;35:*.mpeg=01;35:*.m2v=01;35:*.mkv=01;35:*.webm=01;35:*.webp=01;35:*.ogm=01;35:*.mp4=01;35:*.m4v=01;35:*.mp4v=01;35:*.vob=01;35:*.qt=01;35:*.nuv=01;35:*.wmv=01;35:*.asf=01;35:*.rm=01;35:*.rmvb=01;35:*.flc=01;35:*.avi=01;35:*.fli=01;35:*.flv=01;35:*.gl=01;35:*.dl=01;35:*.xcf=01;35:*.xwd=01;35:*.yuv=01;35:*.cgm=01;35:*.emf=01;35:*.ogv=01;35:*.ogx=01;35:*.aac=00;36:*.au=00;36:*.flac=00;36:*.m4a=00;36:*.mid=00;36:*.midi=00;36:*.mka=00;36:*.mp3=00;36:*.mpc=00;36:*.ogg=00;36:*.ra=00;36:*.wav=00;36:*.oga=00;36:*.opus=00;36:*.spx=00;36:*.xspf=00;36:",
        "SSH_CONNECTION": "37.212.24.248 17200 45.93.137.165 22",
        "LESSCLOSE": "/usr/bin/lesspipe %s %s",
        "TERM": "xterm-256color",
        "LESSOPEN": "| /usr/bin/lesspipe %s",
        "USER": "root",
        "SHLVL": "1",
        "SSH_CLIENT": "37.212.24.248 17200 22",
        "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin",
        "SSH_TTY": "/dev/pts/1",
        "_": "/usr/bin/pm2",
        "OLDPWD": "/root/poker/Poker/server",
        "PM2_USAGE": "CLI",
        "PM2_HOME": "/root/.pm2",
        "unique_id": "55c69c96-caba-4dd7-9ee3-391c020ee867",
        "status": "online",
        "pm_uptime": 1680643638520,
        "axm_actions": [
            {
                "action_name": "km:heapdump",
                "action_type": "internal",
                "arity": 2
            },
            {
                "action_name": "km:cpu:profiling:start",
                "action_type": "internal",
                "arity": 2
            },
            {
                "action_name": "km:cpu:profiling:stop",
                "action_type": "internal",
                "arity": 1
            },
            {
                "action_name": "km:heap:sampling:start",
                "action_type": "internal",
                "arity": 2
            },
            {
                "action_name": "km:heap:sampling:stop",
                "action_type": "internal",
                "arity": 1
            }
        ],
        "axm_monitor": {
            "Used Heap Size": {
                "value": "17.56",
                "type": "internal/v8/heap/used",
                "unit": "MiB",
                "historic": true
            },
            "Heap Usage": {
                "value": 85.98,
                "type": "internal/v8/heap/usage",
                "unit": "%",
                "historic": true
            },
            "Heap Size": {
                "value": "20.43",
                "type": "internal/v8/heap/total",
                "unit": "MiB",
                "historic": true
            },
            "Event Loop Latency p95": {
                "value": "1.07",
                "type": "internal/libuv/latency/p95",
                "unit": "ms",
                "historic": true
            },
            "Event Loop Latency": {
                "value": "0.28",
                "type": "internal/libuv/latency/p50",
                "unit": "ms",
                "historic": true
            },
            "Active handles": {
                "value": 10,
                "type": "internal/libuv/handles",
                "historic": true
            },
            "Active requests": {
                "value": 0,
                "type": "internal/libuv/requests",
                "historic": true
            }
        },
        "axm_options": {
            "error": true,
            "heapdump": true,
            "feature.profiler.heapsnapshot": false,
            "feature.profiler.heapsampling": true,
            "feature.profiler.cpu_js": true,
            "latency": true,
            "catchExceptions": true,
            "profiling": true,
            "metrics": {
                "http": true,
                "runtime": true,
                "eventLoop": true,
                "network": false,
                "v8": true
            },
            "standalone": false,
            "tracing": {
                "outbound": false,
                "enabled": false
            },
            "module_conf": {},
            "apm": {
                "version": "5.0.0",
                "type": "node"
            },
            "module_name": "poker",
            "module_version": "5.2.2"
        },
        "axm_dynamic": {},
        "created_at": 1680643638520,
        "pm_id": 15,
        "restart_time": 0,
        "unstable_restarts": 0,
        "version": "1.0.0",
        "versioning": {
            "type": "git",
            "url": "https://github.com/sleepyComrade/Poker.git",
            "revision": "ac2eeeefca3a3253ba16a1a531633ad4c9b4d293",
            "comment": "Merge pull request #52 from sleepyComrade/feature/refactorchange database",
            "unstaged": true,
            "branch": "develop",
            "remotes": [
                "origin"
            ],
            "remote": "origin",
            "branch_exists_on_remote": true,
            "ahead": false,
            //@ts-ignore
            "next_rev": null,
            "prev_rev": "4f3d0cff123158888857152de66ce11124a21ad0",
            "update_time": "2023-04-04T21:27:18.585Z",
            "repo_path": "/root/poker/Poker"
        },
        "node_version": "18.15.0"
    },
    "pm_id": 15,
    "monit": {
        "memory": 86802432,
        "cpu": 0.2
    }
}
