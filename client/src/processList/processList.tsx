import React, { useEffect, useState } from "react";
import { FileList } from "../fileList/fileList";
import { url } from "../consts";

export function ProcessList(){
    const [processList, setProcessList] = useState<Array<any>>([]);
    const [openFile, setOpenFile] = useState(false);
    const session = localStorage.getItem('session');

    const getProcessList = ()=>{
        fetch(url+`/getProcessList?session=${session}`).then(res=>res.json()).then(data => {
            if (data.ok){
                setProcessList(data.list);
            }
        })
    }

    useEffect(()=>{
        getProcessList();
    }, []);

    return <div>
        {
            openFile && <FileList onCancel={()=>{
                setOpenFile(false);
            }} onOk={(file=>{
                //startProcess;
                console.log(file);
                setOpenFile(false);
            })}/>
        }
        <button onClick={()=>{
            getProcessList();
        }}>refresh</button>
        <button onClick={()=>{
            setOpenFile(true);
        }}>new process</button>
        {processList.map(it=>{
            return <div>
                <span>{it.name} </span>
                <span>{it.pm_id} </span>
                <span>{it.pid} </span> 
                <span>{it.memory} </span>
                <span>{it.cpu} </span>
                <span>{it.status} </span>
                <span>{it.exec_file} </span> 
                <button onClick={()=>{

                }}>restart</button>
                <button onClick={()=>{
                    
                }}>stop</button>
                <button onClick={()=>{
                    
                }}>delete</button>
            </div>
        })}
    </div>
}