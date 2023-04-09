import React, { useEffect, useState } from "react";
import { url } from "./consts";
import { ProcessList } from "./processList/processList";
interface IPanelProps {
    onClose: ()=>void;
}

interface ISiteInfo {
    name: string
}

//const url = 'http://localhost:4004';

export function Panel({onClose}: IPanelProps){
    const [sites, setSites] = useState<ISiteInfo[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [repoUrl, setRepoUrl] = useState('');
    const [port, setPort] = useState('3000');
    const [npmPath, setNpmPath] = useState('./server');
    const [execPath, setExecPath] = useState('./server/dist/panel.js');
    const [files, setFiles] = useState<Array<{size: number, type: string, name: string}>>([]);
    const [path, setPath] = useState('');
   // const [processList, setProcessList] = useState<Array<any>>([]);

    const session = localStorage.getItem('session');

    const getSites = ()=>{
        fetch(url+`/getSites?session=${session}`).then(res=>res.json()).then(data => {
            setSites(data.sites);
        })
    }

    const getDir = (path:string)=>{
        fetch(url+`/getFolder?session=${session}&path=${path}`).then(res=>res.json()).then(data => {
            if (Array.isArray(data.items)){
                setFiles([{name:'..', type: 'dir', size:0}, ...data.items]);
            }
            setPath(data.path);
        })
    }

   /* const getProcessList = ()=>{
        fetch(url+`/getProcessList?session=${session}`).then(res=>res.json()).then(data => {
            if (data.ok){
                setProcessList(data.list);
            }
        })
    }*/

    useEffect(()=>{
        getSites();
        getDir('');
       // getProcessList();
    }, []);

    return <div>
        <ProcessList></ProcessList>
        <div>
            <div>path: {path}</div>
            {files.map(item=>{
                return <div onClick={()=>{
                    if (item.type == 'dir'){
                        getDir(path+'/'+item.name);
                    }
                }}>
                    <span>{item.name} </span>
                    <span>{item.size} </span>
                    <span>{item.type} </span>
                </div>
            })}
        </div>
        <button onClick={()=>{
            getSites();
        }}>refresh</button>
        <button onClick={()=>onClose()}>close</button>
        <button onClick={()=>{
             fetch(url+`/addSite?session=${session}`).then(res=>res.json()).then(data => {
                console.log(data);
                //setSites(data.sites);
            })
        }}>add site</button>
        <div>
            {sites.map(site=>{
                return <div>
                    {site.name}
                    <button onClick={()=>{
                        setSelected(site.name);
                    }}>edit</button>
                </div>
            })}
        </div>
        {
            (selected !==null) && (
                <div>
                    repo:
                    <input type="text" onChange={(e)=>{
                        setRepoUrl(e.target.value)
                    }}></input>
                    port:
                    <input type="text" value={port} onChange={(e)=>{
                        setPort(e.target.value)
                    }}></input>
                    npmPath:
                    <input type="text" value={npmPath} onChange={(e)=>{
                        setNpmPath(e.target.value)
                    }}></input>
                    execPath:
                    <input type="text" value={execPath} onChange={(e)=>{
                        setExecPath(e.target.value)
                    }}></input>
                    <button onClick={()=>{
                        fetch(`${url}/setRepo?session=${session}&name=${selected}&url=${repoUrl}&port=${port}&npmPath=${npmPath}&execPath=${execPath}`).then(res=>res.json()).then(data => {
                            console.log(data);
                            //setSelected(null);
                        })
                    }}>apply</button>
                    <button onClick={()=>{
                        setSelected(null);
                    }}>close</button>
                </div>
            )
        }
    </div>
}
