import React, { useEffect, useState } from "react";

interface IPanelProps {
    onClose: ()=>void;
}

interface ISiteInfo {
    name: string
}

const url = 'http://localhost:4004';

export function Panel({onClose}: IPanelProps){
    const [sites, setSites] = useState<ISiteInfo[]>([]);
    const [selected, setSelected] = useState<string | null>(null);
    const [repoUrl, setRepoUrl] = useState('');
    useEffect(()=>{
        fetch(url+'/getSites').then(res=>res.json()).then(data => {
            setSites(data.sites);
        })
    }, []);
    return <div>
        <button onClick={()=>onClose()}>close</button>
        <button onClick={()=>{
             fetch(url+'/addSite').then(res=>res.json()).then(data => {
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
                    <input type="text" onChange={(e)=>{
                        setRepoUrl(e.target.value)
                    }}></input>
                    <button onClick={()=>{
                        fetch(`${url}/setRepo?name=${selected}&url=${repoUrl}`).then(res=>res.json()).then(data => {
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
