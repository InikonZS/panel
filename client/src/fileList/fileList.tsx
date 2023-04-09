import React, { useEffect, useState } from "react";
import { url } from "../consts";

export function FileList({onOk, onCancel}: {onOk: (file:string)=>void, onCancel: ()=>void}){
    const [files, setFiles] = useState<Array<any>>([]);
    const [path, setPath] = useState('');
    const [selected, setSelected] = useState('');
    
    const session = localStorage.getItem('session');

    const getDir = (path:string)=>{
        fetch(url+`/getFolder?session=${session}&path=${path}`).then(res=>res.json()).then(data => {
            if (Array.isArray(data.items)){
                setFiles([{name:'..', type: 'dir', size:0}, ...data.items]);
            }
            setPath(data.path);
        })
    }

    useEffect(()=>{
        getDir(path);
    }, []);

    return <div>
        <div>path: {path}</div>
        {files.map(item=>{
            return <div style={{border: `${selected==item.name ? '1px solid': ''}`}} onClick={()=>{
                if (item.name == '..'){
                    setSelected('');
                } else {
                   setSelected(item.name) 
                }
            }}
            onDoubleClick={()=>{
                if (item.type == 'dir'){
                    getDir(path+'/'+item.name);
                }
            }}>
                <span>{item.name} </span>
                <span>{item.size} </span>
                <span>{item.type} </span>
            </div>
        })}
        <button onClick={()=>{
            onOk(path+'/'+selected);
        }}>ok</button>
        <button onClick={()=>{
            onCancel();
        }}>cancel</button>
    </div>
}